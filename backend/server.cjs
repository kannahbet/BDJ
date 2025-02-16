const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/docs', express.static('docs'));

const docsFolder = path.join(__dirname, 'docs');
if (!fs.existsSync(docsFolder)) {
  fs.mkdirSync(docsFolder, { recursive: true });
}

// Configuration de multer : stockage + filtre PDF uniquement
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'docs/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype === 'application/pdf'
    ? cb(null, true)
    : cb(new Error('Seuls les fichiers PDF sont autorisés!'), false);
};

const upload = multer({ storage, fileFilter });

// Connexion à la base de données avec Promises
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'basedocs',
}).promise();

db.connect()
  .then(() => console.log('Database connected!'))
  .catch((err) => console.log('Error connecting to database', err));

// Route pour uploader un livre (PDF uniquement)
app.post('/api/upload-book', upload.single('file'), async (req, res) => {
  const { name, author, description } = req.body;
  const filePath = req.file ? req.file.path : null;

  if (!filePath) {
    return res.status(400).json({ message: 'Un fichier PDF est requis.' });
  }

  try {
    await db.query('INSERT INTO `books` (name, author, description, file_path) VALUES (?, ?, ?, ?)', [name, author, description, filePath]);
    res.status(201).json({ message: 'Livre PDF téléchargé avec succès!' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload du livre', error });
  }
});

// Route pour l'enregistrement des utilisateurs
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err });
  }
});

// Route pour la connexion des utilisateurs
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    return match ? res.status(200).json({ message: 'Login successful' }) : res.status(401).json({ message: 'Incorrect password' });
  } catch (err) {
    res.status(500).json({ message: 'Error during login', error: err });
  }
});

// Route pour la création d'un utilisateur avec email et group_id
app.post('/api/users', async (req, res) => {
  const { username, password, email, group_id, isAdmin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password, isAdmin, email, group_id) VALUES (?, ?, ?, ?, ?)', [username, hashedPassword, isAdmin, email, group_id]);
    res.status(201).json({ message: 'Utilisateur créé avec succès !' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur de création de l\'utilisateur', error: err });
  }
});

// Route pour gérer les groupes
app.post('/api/groups', async (req, res) => {
  const { name } = req.body;
  try {
    await db.query('INSERT INTO `groups` (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Group created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error });
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const [groups] = await db.query('SELECT * FROM `groups`');
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des groupes', error: err });
  }
});
app.post('/api/groups/:groupId/permissions', async (req, res) => {
  const { groupId } = req.params;
  const { tag, canView } = req.body;

  if (!tag || canView === undefined) {
    return res.status(400).json({ message: "Tag et canView sont requis" });
  }

  try {
    const sql = 'INSERT INTO `group_permissions` (group_id, tag, can_view) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE can_view = ?';

    await db.execute(sql, [groupId, tag, canView, canView]);

    res.status(201).json({ message: "Permission mise à jour avec succès!" });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la permission:", error);
    res.status(500).json({ message: "Erreur interne", error });
  }
});
app.get('/api/books/:bookId/access', async (req, res) => {
  const { userId } = req.query;
  const { bookId } = req.params;

  if (!userId || !bookId) {
    return res.status(400).json({ message: "userId et bookId sont requis" });
  }

  try {
    const sql = 'SELECT b.id FROM `books` b JOIN `book_tagss` bt ON b.id = bt.book_id JOIN `users` u ON u.id = ? JOIN `group_permissions` gp ON gp.group_id = u.group_id AND gp.tag = bt.tag WHERE b.id = ? AND gp.can_view = TRUE';

    const [rows] = await db.execute(sql, [userId, bookId]);

    if (rows.length > 0) {
      res.status(200).json({ message: "Accès autorisé" });
    } else {
      res.status(403).json({ message: "Accès refusé" });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    res.status(500).json({ message: "Erreur interne", error });
  }
});
app.get('/docs/:bookId', async (req, res) => {
  const { userId } = req.query;
  const { bookId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "userId requis" });
  }

  try {
    const sql = 'SELECT file_path FROM `books` b JOIN `book_tagss` bt ON b.id = bt.book_id JOIN `users` u ON u.id = ? JOIN `group_permissions` gp ON gp.group_id = u.group_id AND gp.tag = bt.tag WHERE b.id = ? AND gp.can_view = TRUE';

    const [rows] = await db.execute(sql, [userId, bookId]);

    if (rows.length > 0) {
      return res.sendFile(path.join(__dirname, rows[0].file_path));
    } else {
      return res.status(403).json({ message: "Accès refusé" });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier:", error);
    res.status(500).json({ message: "Erreur interne", error });
  }
});

app.post("/api/books/:bookId/tags", async (req, res) => {
  const { bookId } = req.params;
  const { tag } = req.body;

  if (!tag) {
      return res.status(400).json({ error: "Le tag est requis" });
  }

  try {
      await db.execute("INSERT INTO `book_tags` (book_id, tag) VALUES (?, ?)", [bookId, tag]);
      res.json({ message: "Tag ajouté !" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
  }
});
app.get("/api/books/:bookId/tags", async (req, res) => {
  const { bookId } = req.params;

  try {
      const [rows] = await db.execute("SELECT tag FROM `book_tags` WHERE book_id = ?", [bookId]);
      res.json(rows.map(row => row.tag));
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/books/access", async (req, res) => {
  const { userTags } = req.query; // Ex: "science,fiction"

  if (!userTags) {
      return res.status(400).json({ error: "Aucun tag fourni" });
  }

  const tagsArray = userTags.split(",");

  try {
      const [rows] = await db.execute('SELECT DISTINCT books.id, books.title FROM `books` JOIN `books_tag` ON books.id = books_tag.book_id WHERE books_tag.tag IN (?)',[tagsArray]);

      res.json(rows);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
  }
});
app.get("/api/books", async (req, res) => {
  try {
      const [rows] = await db.execute("SELECT id, name FROM `books`");
      res.json(rows);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
  }
});


// Route pour récupérer les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const [result] = await db.query('SELECT id,username, email, group_id FROM `users`');
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.delete("/api/users/:id", async (req, res) => {
  const id  = req.params.id
  
  try {
    const result = await db.execute('DELETE FROM `users` WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Route pour récupérer tous les livres
app.get('/api/listbooks', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM `books`');
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.delete("/api/book/:id", async (req, res) => {
  const id  = req.params.id
  
  try {
    const result = await db.execute('DELETE FROM `books` WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    res.status(200).json({ message: "Document supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});