const Express = require('express');
const router = Express.Router();
const DB = require('./database.js');
const PythonShell = require('python-shell');


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
  DB.data.query('INSERT INTO `position` (objet, x, y) VALUE (?, ?, ?)', [req.body.objet, req.body.posx, req.body.posy], (err) => {
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
    DB.data.query('SELECT * FROM objet', [req.params.id], (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
  } else {
    DB.data.query('SELECT * FROM objet WHERE id = ?', [req.params.id], (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
  }
});

router.get('/marqueur/:id', (req, res, next) => {
  if (req.params.id === 'all') {
    DB.data.query('SELECT x, y FROM position', (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
  } else {
    DB.data.query('SELECT x, y FROM position WHERE objet = ?', [req.params.id], (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    })
  }
});

router.get('/chemin', (req, res, next) => {
  const debut = JSON.parse(req.query.debut);
  const fin = JSON.parse(req.query.fin);

  const pyshell = new PythonShell.PythonShell('dijkstra.py');

  DB.data.query('SELECT x, y FROM position', (err, data) => {
    if (err) {
      return next(err);
    }
    pyshell.send(JSON.stringify([debut, fin, data]));

    pyshell.on('message', function (message) {
      console.log(message);
      res.json(message);
    });

    pyshell.end(function (err) {
      if (err){
        throw err;
      }
      console.log('finished');
    });
  })


});


module.exports.router = router;
