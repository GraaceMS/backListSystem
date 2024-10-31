// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Configuração do CORS e body-parser
app.use(cors());
app.use(bodyParser.json());

// Configuração da conexão com o banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',             // Usuário do PostgreSQL
  host: 'localhost',            // Host do PostgreSQL
  database: 'postgres',         // Nome do banco de dados
  password: '123456',           // Senha do PostgreSQL
  port: 5432,                   // Porta padrão do PostgreSQL
});

// Teste de conexão ao banco de dados
pool.connect((err) => {
  if (err) {
    console.error('Erro de conexão ao banco de dados', err);
  } else {
    console.log('Conectado ao banco de dados');
  }
});

// Rota para listar todas as tarefas
app.get('/tarefas', async (req, res) => {
  try {
    const tarefas = await pool.query('SELECT * FROM Tarefas');
    res.json(tarefas.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar tarefas');
  }
});

// Rota para adicionar uma nova tarefa
app.post('/tarefas', async (req, res) => {
  const { nome_tarefa, custo, data_limite } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Tarefas (nome_tarefa, custo, data_limite, ordem_apresentacao) VALUES ($1, $2, $3, (SELECT COALESCE(MAX(ordem_apresentacao), 0) + 1 FROM Tarefas)) RETURNING *',
      [nome_tarefa, custo, data_limite]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar tarefa' });
  }
});

// Rota para editar uma tarefa existente
app.put('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_tarefa, custo, data_limite } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Tarefas SET nome_tarefa = $1, custo = $2, data_limite = $3 WHERE id = $4 RETURNING *',
      [nome_tarefa, custo, data_limite, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao editar tarefa' });
  }
});

// Rota para excluir uma tarefa
app.delete('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Tarefas WHERE id = $1', [id]);
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
