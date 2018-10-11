const Express = require('express');
const router = Express.Router();
const DB = require('./database.js');


router.post('/create', (req, res, next) => {
  DB.data.query('INSERT INTO objet (nom, vie, moyenne, variance, matiere) VALUES (?, ?, ?, ?, ?)', [req.body.nom, req.body.vie, req.body.moyenne, req.body.variance, req.body.matiere], (err) => {
    if (err) {
      return next(err);
    }
    DB.data.query('SELECT id FROM objet WHERE nom = ?', [req.body.nom], (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    })

  });
});

router.post('/place', (req, res, next) => {
  DB.data.query('INSERT INTO position (objet, x, y) VALUES (?, ?, ?)', [req.body.objet, req.body.posx, req.body.posy], (err) => {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
});

router.patch('/objet/:id', (req, res, next) => {
  DB.data.query('UPDATE objet SET nom = ?, matiere = ?, vie = ?, moyenne = ?, variance = ? WHERE id = ?', [req.body.nom, req.body.matiere, req.body.vie, req.body.moyenne, req.body.variance, req.params.id], (err) => {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
});

router.delete('/objet/:id', (req, res, next) => {
  DB.data.query('DELETE FROM objet WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return next(err);
    }
    res.status(200).end();
  });
});

router.get('/objet/:id', (req, res, next) => {
  if (req.params.id === 'all') {
    DB.data.query('SELECT * FROM Objet', [req.params.id], (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
  } else {
    DB.data.query('SELECT * FROM Objet WHERE id = ?', [req.params.id], (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
  }
});

module.exports.router = router;
