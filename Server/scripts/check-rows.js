import pg from 'pg';

const uri = "postgresql://postgres.ummyrqngtmgpgjerdvib:%40Icadn%29itt123@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";
const { Client } = pg;

async function checkRows() {
  const client = new Client({ connectionString: uri });
  await client.connect();
  const tables = ['Admin', 'Teacher', 'QuestionPaper', 'Question', 'AnswerSheet', 'Evaluation', 'AIEvaluation'];
  for (const table of tables) {
    const res = await client.query(`SELECT * FROM "${table}" LIMIT 1`);
    console.log(`Table ${table} first row:`, res.rows[0]);
  }
  await client.end();
}
checkRows();
