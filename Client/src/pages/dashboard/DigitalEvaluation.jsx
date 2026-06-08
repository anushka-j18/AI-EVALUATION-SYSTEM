import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
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
    const durationInMinutes = (currentTime - evaluationStartTime) / 1000 / 60;

    if (durationInMinutes < 2) {
      const remainingSeconds = Math.ceil((2 * 60) - ((currentTime - evaluationStartTime) / 1000));
      alert(`Minimum evaluation time is 2 minutes. Please review the paper carefully.\nWait ${Math.floor(remainingSeconds/60)}m ${remainingSeconds%60}s more before submitting.`);
      return;
    }

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
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Preparing Evaluation Environment...</h2>
      </div>
    );
  }

  if (error || !sheet || !evaluation) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center max-w-2xl mx-auto mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p className="text-red-200">{error || "Something went wrong."}</p>
        <button onClick={() => navigate("/dashboard")} className="mt-6 px-6 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700">Go Back</button>
      </div>
    );
  }

  const isPdf = sheet.fileUrl.toLowerCase().endsWith(".pdf");
  const fileUrl = `http://localhost:5001/${sheet.fileUrl.replace(/\\/g, "/")}`;
  
  const qpUrl = sheet.questionPaper?.fileUrl ? `http://localhost:5001/${sheet.questionPaper.fileUrl.replace(/\\/g, "/")}` : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 -mx-4 md:-mx-6 px-4 md:px-6">
      
      {/* 1. LEFT PANEL: Question Paper Drawer */}
      {showQPaper && qpUrl && (
        <div className="w-full lg:w-[30%] h-[50vh] lg:h-full bg-slate-900 rounded-3xl border border-white/10 flex flex-col shadow-2xl overflow-hidden shrink-0 transition-all">
          <div className="bg-slate-950 px-4 py-3 border-b border-white/10 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-white flex items-center gap-2"><FileText size={18} className="text-cyan-400"/> Question Paper</h3>
            <button onClick={() => setShowQPaper(false)} className="p-1 hover:bg-white/10 rounded-lg text-gray-400">
              <PanelLeftClose size={20} />
            </button>
          </div>
          <div className="flex-1 bg-white">
            <iframe src={`${qpUrl}#toolbar=0`} className="w-full h-full" title="Question Paper" />
          </div>
        </div>
      )}

      {/* 2. CENTER PANEL: Answer Script Viewer & Annotations */}
      <div className={`w-full ${showQPaper ? 'lg:w-[40%]' : 'lg:w-1/2'} h-[50vh] lg:h-full bg-slate-900 rounded-3xl border border-white/10 flex flex-col overflow-hidden relative shadow-2xl transition-all`}>
        <div className="bg-slate-950 px-4 py-3 border-b border-white/10 flex justify-between items-center z-20 shrink-0 flex-wrap gap-3">
          
          <div className="flex items-center gap-3">
            {!showQPaper && qpUrl && (
              <button onClick={() => setShowQPaper(true)} className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg text-sm font-bold border border-cyan-500/20">
                <PanelLeftOpen size={16} /> View Q. Paper
              </button>
            )}
            <div className="truncate">
              <h3 className="font-bold text-white truncate">{sheet.studentName}</h3>
              <p className="text-xs text-gray-400">Roll: {sheet.rollNumber}</p>
            </div>
          </div>

          {/* DRAWING TOOLBAR */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1 gap-1">
             <button 
                onClick={() => setDrawMode("scroll")}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold ${drawMode === 'scroll' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                title="Scroll/Pan Document"
             >
               <MousePointer2 size={16} />
             </button>
             <button 
                onClick={() => setDrawMode("tick")}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold ${drawMode === 'tick' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:bg-white/5'}`}
                title="Drop Tick"
             >
               <Check size={18} className="text-green-500" />
             </button>
             <button 
                onClick={() => setDrawMode("cross")}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold ${drawMode === 'cross' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:bg-white/5'}`}
                title="Drop Cross"
             >
               <X size={18} className="text-red-500" />
             </button>
             <button 
                onClick={() => setDrawMode("pencil")}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold ${drawMode === 'pencil' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
                title="Freehand Pencil"
             >
               <Pencil size={18} className="text-blue-500" />
             </button>
             
             <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
             
             <button onClick={undoLastAnnotation} disabled={annotations.length === 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-30">
               <Undo2 size={16} />
             </button>
          </div>

          <div className="flex gap-2 hidden xl:flex">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"><ZoomOut size={16} /></button>
            <span className="px-1 py-1 text-xs text-gray-500 flex items-center font-mono w-10 justify-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400"><ZoomIn size={16} /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-black/50 p-4 flex items-start justify-center relative">
          
          <div 
            ref={containerRef}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }} 
            className="w-full max-w-4xl min-h-[1000px] h-auto relative origin-top bg-white rounded-xl shadow-2xl"
          >
            {/* DOCUMENT RENDERER */}
            {isPdf ? (
              <div className="w-full flex flex-col items-center py-4 bg-gray-100 rounded-xl overflow-hidden">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="p-10 text-cyan-600 font-bold animate-pulse text-xl">Loading PDF Pages...</div>}
                  error={<div className="p-10 text-red-500 font-bold">Failed to load PDF!</div>}
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
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur pointer-events-none shadow-xl border border-white/10 z-20">
                 {drawMode === 'pencil' ? 'Click and drag to draw.' : `Click anywhere to drop ${drawMode === 'tick' ? 'a tick' : 'a cross'}.`} Switch to Scroll mode to scroll.
               </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. RIGHT PANEL: Evaluation Form */}
      <div className={`w-full ${showQPaper ? 'lg:w-[30%]' : 'lg:w-1/2'} h-auto lg:h-full flex flex-col bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden transition-all shrink-0`}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-slate-900/50 shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white">Grading Form</h2>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-black text-cyan-400">{evaluation.totalMarks}</div>
              <div className="text-sm text-gray-500 font-bold">/ {sheet.questionPaper?.totalMarks}</div>
            </div>
            {evaluation.questionWiseMarks.reduce((sum, q) => sum + (Number(q.obtainedMarks) || 0), 0) > (evaluation.totalMarks || 0) && (
              <div className="text-[10px] text-orange-400 font-bold bg-orange-500/20 px-2 py-0.5 rounded-full mt-1 border border-orange-500/30">
                Best N Applied
              </div>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {evaluation.questionWiseMarks.length === 0 ? (
            <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl text-center shadow-lg">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-red-400 font-bold text-lg mb-1">No Questions Found</h3>
              <p className="text-red-300 text-sm leading-relaxed">
                The attached Question Paper does not have any saved questions in the database. Please inform the Admin to upload and save questions for this paper so you can grade them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {evaluation.questionWiseMarks.map((qm, idx) => (
                <div key={qm.questionId} className={`bg-slate-900/60 border border-white/5 rounded-2xl p-3 transition-all focus-within:border-cyan-500/50 focus-within:bg-slate-800/80 ${qm.isNotAttempted ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-cyan-400 text-base">Q{qm.questionNo}.</div>
                      <button
                        onClick={() => handleNotAttemptedToggle(idx)}
                        className={`text-[10px] px-2 py-1 rounded-md font-bold transition ${qm.isNotAttempted ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-800 text-gray-500 border border-white/5 hover:bg-slate-700'}`}
                      >
                        {qm.isNotAttempted ? 'Not Attempted' : 'Mark NA'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number" min="0" max={qm.maxMarks} step="0.5"
                        value={qm.obtainedMarks}
                        disabled={qm.isNotAttempted}
                        onChange={(e) => handleMarkChange(idx, "obtainedMarks", e.target.value)}
                        className={`w-16 bg-slate-950 border border-white/10 rounded-lg py-1.5 px-2 text-center text-white font-bold focus:ring-2 focus:ring-cyan-500 focus:outline-none ${qm.isNotAttempted ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <span className="text-gray-500 text-sm font-bold">/ {qm.maxMarks}</span>
                    </div>
                  </div>
                  <input 
                    type="text"
                    placeholder="Add feedback..."
                    value={qm.comment}
                    disabled={qm.isNotAttempted}
                    onChange={(e) => handleMarkChange(idx, "comment", e.target.value)}
                    className={`w-full bg-slate-950/50 border border-white/5 rounded-lg p-2 text-xs text-gray-300 focus:ring-1 focus:ring-cyan-500 focus:outline-none ${qm.isNotAttempted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-white/5">
            <label className="block text-xs font-bold text-gray-300 mb-1">Overall Comments</label>
            <textarea 
              value={evaluation.overallComments}
              onChange={(e) => setEvaluation({...evaluation, overallComments: e.target.value})}
              rows="3"
              className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none text-sm"
              placeholder="Provide overall feedback..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-slate-900/80 shrink-0 grid grid-cols-3 gap-2">
          <button onClick={handleRunAI} disabled={runningAI} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 disabled:opacity-50">
            {runningAI ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
            <span className="text-[10px] font-semibold uppercase tracking-wider">AI Assist</span>
          </button>
          
          <button onClick={handleSaveDraft} disabled={saving} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            <span className="text-[10px] font-semibold uppercase tracking-wider">Save Draft</span>
          </button>
          
          <button onClick={handleSubmit} disabled={submitting} className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:scale-[1.02] transition-transform shadow-lg shadow-green-500/20 disabled:opacity-50">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalEvaluation;
