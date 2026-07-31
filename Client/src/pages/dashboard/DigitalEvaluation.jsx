import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { SERVER_URL } from "../../api/axiosConfig";
import { Loader2, Save, Send, Brain, ZoomIn, ZoomOut, Check, X, MousePointer2, FileText, AlertCircle, PanelLeftClose, PanelLeftOpen, Undo2, Pencil } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DigitalEvaluation = () => {
  const { answerSheetId } = useParams();
  const navigate = useNavigate();

  const [sheet, setSheet] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runningAI, setRunningAI] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState("");

  // New states for Layout & Annotations
  const [showQPaper, setShowQPaper] = useState(false);
  const [drawMode, setDrawMode] = useState("scroll"); // 'scroll', 'tick', 'cross', 'pencil'
  const [annotations, setAnnotations] = useState([]);
  const [numPages, setNumPages] = useState(null);
  
  const [currentStroke, setCurrentStroke] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  
  const containerRef = useRef(null);

const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const sheetRes = await api.get(`/answer-sheets/${answerSheetId}`);
      setSheet(sheetRes.data.answerSheet);

      const evalRes = await api.post(`/teacher-evaluations/start/${answerSheetId}`);
      setEvaluation(evalRes.data.evaluation);
      
      // Load saved annotations if they exist
      if (evalRes.data.evaluation.annotations) {
        setAnnotations(evalRes.data.evaluation.annotations);
      }
    } catch (err) {
      console.error("Failed to load evaluation data:", err);
      setError("Failed to load data. The script might not exist or you don't have permission.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [answerSheetId]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [loading, error]);

  

  const calculateTotalMarks = (marksList) => {
    const groups = {};
    let total = 0;

    marksList.forEach((q, idx) => {
      let key;
      if (q.groupId) {
        key = `group_${q.groupId}`;
      } else if (q.requiredAttempts && q.section) {
        key = `section_${q.section}`;
      } else {
        key = `ungrouped_${idx}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });

    Object.values(groups).forEach(groupQs => {
      const reqAttempts = groupQs.find(q => q.requiredAttempts)?.requiredAttempts || groupQs.length;
      const sorted = [...groupQs].sort((a, b) => (Number(b.obtainedMarks) || 0) - (Number(a.obtainedMarks) || 0));
      const topN = sorted.slice(0, reqAttempts);
      total += topN.reduce((sum, q) => sum + (Number(q.obtainedMarks) || 0), 0);
    });

    return total;
  };

  const handleMarkChange = (index, field, value) => {
    if (field === "obtainedMarks" && Number(value) > 0) {
      const qm = evaluation.questionWiseMarks[index];
      const hasComment = qm.comment && qm.comment.trim().length > 0;
      const hasAnnotations = annotations && annotations.length > 0;
      
      if (!hasComment && !hasAnnotations) {
        alert(`Please add a comment or draw a tick mark on the paper before awarding marks for Q${qm.questionNo}.`);
        return;
      }
    }

    const updatedMarks = [...evaluation.questionWiseMarks];
    updatedMarks[index] = { ...updatedMarks[index], [field]: value };
    
    const newTotal = calculateTotalMarks(updatedMarks);
    
    setEvaluation({
      ...evaluation,
      questionWiseMarks: updatedMarks,
      totalMarks: newTotal,
    });
  };

  const handleNotAttemptedToggle = (index) => {
    const updatedMarks = [...evaluation.questionWiseMarks];
    const currentlyNA = updatedMarks[index].isNotAttempted;
    
    if (!currentlyNA) {
      updatedMarks[index] = { 
        ...updatedMarks[index], 
        isNotAttempted: true, 
        obtainedMarks: 0, 
        comment: "Not Attempted" 
      };
    } else {
      updatedMarks[index] = { 
        ...updatedMarks[index], 
        isNotAttempted: false, 
        obtainedMarks: 0, 
        comment: "" 
      };
    }
    
    const newTotal = calculateTotalMarks(updatedMarks);
    
    setEvaluation({
      ...evaluation,
      questionWiseMarks: updatedMarks,
      totalMarks: newTotal,
    });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await api.put(`/teacher-evaluations/${evaluation._id}/save-draft`, {
        questionWiseMarks: evaluation.questionWiseMarks,
        overallComments: evaluation.overallComments,
        annotations,
      });
      alert("Draft saved successfully!");
    } catch (err) {
      console.error("Save draft error:", err);
      alert("Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const evaluationStartTime = new Date(evaluation.createdAt).getTime();
    const currentTime = new Date().getTime();

    const hasGlobalAnnotations = annotations && annotations.length > 0;
    const invalidQuestions = evaluation.questionWiseMarks.filter(qm => 
      Number(qm.obtainedMarks) > 0 && 
      !(qm.comment && qm.comment.trim().length > 0) &&
      !hasGlobalAnnotations &&
      !qm.isNotAttempted
    );

    if (invalidQuestions.length > 0) {
      const qNos = invalidQuestions.map(q => q.questionNo).join(", ");
      alert(`You have awarded marks for Q(${qNos}) without providing any feedback. Please add a comment or draw tick marks on the paper.`);
      return;
    }

    if (!window.confirm("Are you sure you want to submit? This cannot be undone.")) return;
    
    setSubmitting(true);
    try {
      await api.put(`/teacher-evaluations/${evaluation._id}/submit`, {
        questionWiseMarks: evaluation.questionWiseMarks,
        overallComments: evaluation.overallComments,
        annotations,
      });
      alert("Evaluation submitted successfully!");
      navigate("/dashboard/evaluated");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit evaluation.");
      setSubmitting(false);
    }
  };

  const handleRunAI = async () => {
    setRunningAI(true);
    try {
      await api.post(`/teacher-evaluations/${answerSheetId}/ai-evaluate`, {
        checkingMode: "medium",
      });
      alert("AI Evaluation completed! Go to AI Evaluation tab to see the comparison.");
    } catch (err) {
      console.error("AI error:", err);
      alert("AI Evaluation failed.");
    } finally {
      setRunningAI(false);
    }
  };

  // Annotation Click Handler
  const handlePointerDown = (e) => {
    if (drawMode === "scroll") return;
    if (!containerRef.current) return;

    if (e.pointerType === "touch" && drawMode === "pencil") {
      try { e.target.releasePointerCapture(e.pointerId); } catch(err){}
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (drawMode === "pencil") {
      setCurrentStroke([{ x, y }]);
    } else {
      setAnnotations([...annotations, { x, y, type: drawMode }]);
      setDrawMode("scroll"); 
    }
  };

  const handlePointerMove = (e) => {
    if (drawMode !== "pencil" || !currentStroke) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCurrentStroke([...currentStroke, { x, y }]);
  };

  const handlePointerUp = () => {
    if (drawMode === "pencil" && currentStroke) {
      setAnnotations([...annotations, { type: "pencil", points: currentStroke }]);
      setCurrentStroke(null);
    }
  };

  const undoLastAnnotation = () => {
    setAnnotations(annotations.slice(0, -1));
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
        <h2 className="text-2xl font-black text-slate-800">Preparing Evaluation Environment...</h2>
      </div>
    );
  }

  if (error || !sheet || !evaluation) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center max-w-2xl mx-auto mt-10 shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 drop-shadow-md" />
        <h2 className="text-2xl font-black text-red-500 mb-2">Error</h2>
        <p className="text-red-400 font-bold mb-6">{error || "Something went wrong."}</p>
        <button onClick={() => navigate("/dashboard")} className="px-8 py-3 bg-[#f1f5f9] rounded-2xl text-slate-600 hover:text-slate-800 font-bold shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all">Go Back</button>
      </div>
    );
  }

  const isPdf = sheet.fileUrl.toLowerCase().endsWith(".pdf");
  const fileUrl = `${SERVER_URL}/${sheet.fileUrl.replace(/\\/g, "/")}`;
  
  const qpUrl = sheet.questionPaper?.fileUrl ? `${SERVER_URL}/${sheet.questionPaper.fileUrl.replace(/\\/g, "/")}` : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8 -mx-4 md:-mx-6 px-4 md:px-6">
      
      {/* 1. LEFT PANEL: Question Paper Drawer */}
      {showQPaper && qpUrl && (
        <div className="w-full lg:w-[30%] h-[50vh] lg:h-full bg-[#f1f5f9] rounded-[3rem] border border-white/80 flex flex-col shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] overflow-hidden shrink-0 transition-all">
          <div className="bg-[#f1f5f9] px-6 py-4 border-b border-white/60 flex justify-between items-center shrink-0 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] rounded-t-[3rem] z-10">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><FileText size={20} className="text-blue-500"/> Question Paper</h3>
            <button onClick={() => setShowQPaper(false)} className="p-2 bg-[#f1f5f9] hover:text-slate-800 rounded-xl text-slate-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all">
              <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="flex-1 bg-white relative">
            <iframe src={`${qpUrl}#toolbar=0`} className="w-full h-full border-0" title="Question Paper" />
          </div>
        </div>
      )}

      {/* 2. CENTER PANEL: Answer Script Viewer & Annotations */}
      <div className={`w-full ${showQPaper ? 'lg:w-[40%]' : 'lg:w-1/2'} h-[50vh] lg:h-full bg-[#f1f5f9] rounded-[3rem] border border-white/80 flex flex-col overflow-hidden relative shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] transition-all`}>
        <div className="bg-[#f1f5f9] px-6 py-4 border-b border-white/60 flex justify-between items-center z-20 shrink-0 flex-wrap gap-4 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] rounded-t-[3rem]">
          
          <div className="flex items-center gap-4">
            {!showQPaper && qpUrl && (
              <button onClick={() => setShowQPaper(true)} className="flex items-center gap-2 px-4 py-2 bg-[#f1f5f9] text-blue-600 rounded-xl text-sm font-bold shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all">
                <PanelLeftOpen size={18} /> View Q. Paper
              </button>
            )}
            <div className="truncate">
              <h3 className="font-black text-slate-800 truncate text-lg">{sheet.studentName}</h3>
              <p className="text-xs text-slate-500 font-bold">Roll: {sheet.rollNumber}</p>
            </div>
          </div>

          {/* DRAWING TOOLBAR */}
          <div className="flex items-center bg-[#f1f5f9] rounded-2xl p-1.5 gap-2 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
             <button 
                onClick={() => setDrawMode("scroll")}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${drawMode === 'scroll' ? 'bg-[#f1f5f9] text-blue-600 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Scroll/Pan Document"
             >
               <MousePointer2 size={18} />
             </button>
             <button 
                onClick={() => setDrawMode("tick")}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${drawMode === 'tick' ? 'bg-[#f1f5f9] text-green-600 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Drop Tick"
             >
               <Check size={20} className={drawMode === 'tick' ? "text-green-600" : ""} />
             </button>
             <button 
                onClick={() => setDrawMode("cross")}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${drawMode === 'cross' ? 'bg-[#f1f5f9] text-red-600 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Drop Cross"
             >
               <X size={20} className={drawMode === 'cross' ? "text-red-600" : ""} />
             </button>
             <button 
                onClick={() => setDrawMode("pencil")}
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${drawMode === 'pencil' ? 'bg-[#f1f5f9] text-purple-600 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff]' : 'text-slate-400 hover:text-slate-600'}`}
                title="Freehand Pencil"
             >
               <Pencil size={18} className={drawMode === 'pencil' ? "text-purple-600" : ""} />
             </button>
             
             <div className="w-[2px] h-6 bg-slate-200 mx-1 rounded-full"></div>
             
             <button onClick={undoLastAnnotation} disabled={annotations.length === 0} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 disabled:opacity-30 transition-colors">
               <Undo2 size={18} />
             </button>
          </div>

          <div className="flex gap-2 hidden xl:flex items-center">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-2 bg-[#f1f5f9] hover:text-slate-800 rounded-xl text-slate-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"><ZoomOut size={18} /></button>
            <span className="px-2 py-1 text-sm text-slate-600 font-bold font-mono w-14 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-2 bg-[#f1f5f9] hover:text-slate-800 rounded-xl text-slate-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"><ZoomIn size={18} /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-[#e2e8f0] p-6 flex items-start justify-center relative shadow-[inset_10px_10px_20px_#cbd5e1,inset_-10px_-10px_20px_#ffffff]">
          
          <div 
            ref={containerRef}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }} 
            className="w-full max-w-4xl min-h-[1000px] h-auto relative origin-top bg-white rounded-xl shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]"
          >
            {/* DOCUMENT RENDERER */}
            {isPdf ? (
              <div className="w-full flex flex-col items-center py-4 bg-gray-100 rounded-xl overflow-hidden">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="p-10 text-blue-600 font-black animate-pulse text-xl">Loading PDF Pages...</div>}
                  error={<div className="p-10 text-red-500 font-black">Failed to load PDF!</div>}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page 
                      key={`page_${index + 1}`} 
                      pageNumber={index + 1} 
                      className="mb-6 shadow-md border border-gray-300"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={containerWidth ? containerWidth : 800}
                    />
                  ))}
                </Document>
              </div>
            ) : (
              <img src={fileUrl} alt="Answer Script" className="w-full h-auto object-contain rounded-xl" />
            )}

            {/* ANNOTATION CANVAS / OVERLAY */}
            <div 
               className={`absolute inset-0 z-10 ${drawMode !== 'scroll' ? (drawMode === 'pencil' ? 'cursor-crosshair touch-none' : 'cursor-crosshair') : 'pointer-events-none'}`}
               onPointerDown={handlePointerDown}
               onPointerMove={handlePointerMove}
               onPointerUp={handlePointerUp}
               onPointerLeave={handlePointerUp}
            >
               {/* PENCIL STROKES */}
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                 {annotations.filter(a => a.type === 'pencil').map((ann, i) => (
                   <polyline 
                     key={i} 
                     points={ann.points.map(p => `${p.x},${p.y}`).join(" ")} 
                     fill="none" 
                     stroke="#ef4444" 
                     strokeWidth="0.2" 
                     strokeLinecap="round" 
                     strokeLinejoin="round" 
                   />
                 ))}
                 {currentStroke && (
                   <polyline 
                     points={currentStroke.map(p => `${p.x},${p.y}`).join(" ")} 
                     fill="none" 
                     stroke="#ef4444" 
                     strokeWidth="0.2" 
                     strokeLinecap="round" 
                     strokeLinejoin="round" 
                   />
                 )}
               </svg>

               {/* TICKS AND CROSSES */}
               {annotations.map((ann, i) => {
                 if (ann.type === 'pencil') return null;
                 return (
                   <div 
                      key={i} 
                      className="absolute font-black text-3xl pointer-events-none drop-shadow-lg"
                      style={{ left: `${ann.x}%`, top: `${ann.y}%`, transform: 'translate(-50%, -50%)' }}
                   >
                     {ann.type === 'tick' ? (
                        <Check className="text-green-600" size={40} strokeWidth={4} />
                     ) : (
                        <X className="text-red-600" size={40} strokeWidth={4} />
                     )}
                   </div>
                 );
               })}
            </div>

            {/* MESSAGE OVERLAY FOR SCROLLING */}
            {drawMode !== 'scroll' && isPdf && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#f1f5f9]/90 text-slate-800 px-6 py-3 rounded-full text-sm font-black backdrop-blur-md pointer-events-none shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] border border-white/80 z-20">
                 {drawMode === 'pencil' ? 'Click and drag to draw.' : `Click anywhere to drop ${drawMode === 'tick' ? 'a tick' : 'a cross'}.`} Switch to Scroll mode to scroll.
               </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. RIGHT PANEL: Evaluation Form */}
      <div className={`w-full ${showQPaper ? 'lg:w-[30%]' : 'lg:w-1/2'} h-auto lg:h-full flex flex-col bg-[#f1f5f9] border border-white/80 rounded-[3rem] shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff] overflow-hidden transition-all shrink-0`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/60 bg-[#f1f5f9] shrink-0 flex justify-between items-center shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] rounded-t-[3rem] z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Grading Form</h2>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-black text-blue-600">{evaluation.totalMarks}</div>
              <div className="text-sm text-slate-500 font-bold">/ {sheet.questionPaper?.totalMarks}</div>
            </div>
            {evaluation.questionWiseMarks.reduce((sum, q) => sum + (Number(q.obtainedMarks) || 0), 0) > (evaluation.totalMarks || 0) && (
              <div className="text-xs text-orange-600 font-bold bg-[#f1f5f9] px-3 py-1 rounded-xl mt-1 shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]">
                Best N Applied
              </div>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {evaluation.questionWiseMarks.length === 0 ? (
            <div className="bg-[#f1f5f9] p-6 rounded-3xl text-center shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 drop-shadow-md" />
              <h3 className="text-red-500 font-black text-xl mb-2">No Questions Found</h3>
              <p className="text-red-400 font-medium text-sm leading-relaxed">
                The attached Question Paper does not have any saved questions in the database. Please inform the Admin to upload and save questions for this paper so you can grade them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluation.questionWiseMarks.map((qm, idx) => (
                <div key={qm.questionId} className={`bg-[#f1f5f9] rounded-[2rem] p-4 transition-all shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] ${qm.isNotAttempted ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-black text-blue-600 text-lg">Q{qm.questionNo}.</div>
                      <button
                        onClick={() => handleNotAttemptedToggle(idx)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] ${qm.isNotAttempted ? 'bg-[#f1f5f9] text-orange-500' : 'bg-[#f1f5f9] text-slate-500 hover:text-slate-700'}`}
                      >
                        {qm.isNotAttempted ? 'Not Attempted' : 'Mark NA'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" min="0" max={qm.maxMarks} step="0.5"
                        value={qm.obtainedMarks}
                        disabled={qm.isNotAttempted}
                        onChange={(e) => handleMarkChange(idx, "obtainedMarks", e.target.value)}
                        className={`w-20 bg-[#f1f5f9] border-none rounded-xl py-2 px-2 text-center text-slate-800 font-black shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-blue-500 focus:outline-none ${qm.isNotAttempted ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <span className="text-slate-500 text-sm font-bold">/ {qm.maxMarks}</span>
                    </div>
                  </div>
                  <input 
                    type="text"
                    placeholder="Add feedback..."
                    value={qm.comment}
                    disabled={qm.isNotAttempted}
                    onChange={(e) => handleMarkChange(idx, "comment", e.target.value)}
                    className={`w-full bg-[#f1f5f9] border-none rounded-xl p-3 text-sm text-slate-700 font-medium shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-blue-500 focus:outline-none ${qm.isNotAttempted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-white/60">
            <label className="block text-sm font-black text-slate-600 mb-2">Overall Comments</label>
            <textarea 
              value={evaluation.overallComments}
              onChange={(e) => setEvaluation({...evaluation, overallComments: e.target.value})}
              rows="3"
              className="w-full bg-[#f1f5f9] border-none rounded-2xl p-4 text-slate-700 font-medium shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
              placeholder="Provide overall feedback..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/60 bg-[#f1f5f9] shrink-0 grid grid-cols-2 gap-4 rounded-b-[3rem] shadow-[inset_0px_10px_20px_-10px_#cbd5e1] z-10">
          <button onClick={handleSaveDraft} disabled={saving} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#f1f5f9] text-blue-600 hover:text-blue-700 font-bold shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="text-xs uppercase tracking-wider">Save Draft</span>
          </button>
          
          <button onClick={handleSubmit} disabled={submitting} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 font-bold shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all disabled:opacity-50">
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            <span className="text-xs uppercase tracking-wider">Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalEvaluation;
