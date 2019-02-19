const Express = require('express');
const router = Express.Router();
const DB = require('./database.js');
const PythonShell = require('python-shell');
const Storage = require('./storage');
const Path = require('path');
const Fs = require('fs');


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
    DB.data.query('SELECT * FROM objet ORDER BY nom', [req.params.id], (err, data) => {
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

router.get('/pointer/draw', (req, res, next) => {
  DB.data.query('SELECT position.id AS id, position.x AS x, position.y AS y, objet.moyenne AS moyenne, objet.matiere AS matiere FROM position INNER JOIN objet ON objet.id=position.objet WHERE ((position.x - ?)*(position.x - ?) + (position.y - ?)*(position.y - ?)) < ?', [req.query.x, req.query.x, req.query.y, req.query.y, 100], (err, data) => {
    if (err) {
      return next(err)
    }
    res.json(data);
  });
});

router.delete('/pointer/draw', (req, res, next) => {
  DB.data.query('DELETE FROM position WHERE ((position.x - ?)*(position.x - ?) + (position.y - ?)*(position.y - ?)) < ?', [req.query.x, req.query.x, req.query.y, req.query.y, 100], (err, data) => {
    if (err) {
      return next(err)
    }
    res.status(200).end();
  });
});

router.get('/chemin', (req, res, next) => {
  const debut = JSON.parse(req.query.debut);
  const fin = JSON.parse(req.query.fin);
  const mode = JSON.parse(req.query.mode);

  const pyshell = new PythonShell.PythonShell('dijkstra.py');

  const center = {
    x: (fin.x + debut.x)/2,
    y: (fin.y + debut.y)/2,
    r: (fin.x - debut.x)*(fin.x - debut.x) + (fin.y - debut.y)*(fin.y - debut.y),
  };


  let timer = Date.now();

  DB.data.query('SELECT position.x AS x, position.y AS y, objet.vie AS vie, objet.moyenne AS moyenne, objet.variance AS variance, objet.matiere AS matiere FROM position INNER JOIN objet ON objet.id=position.objet WHERE ((position.x - ?)*(position.x - ?) + (position.y - ?)*(position.y - ?)) < ?', [center.x, center.x, center.y, center.y, center.r], (err, data) => {
    if (err) {
      return next(err);
    }
    pyshell.send(JSON.stringify([mode, debut, fin, data]));

    pyshell.on('message', function (message) {

      data = JSON.parse(message.split('\'').join('"'));
      for(let key in data) {
        if (key !== "path") {
          console.log(key + " : " + JSON.stringify(data[key]) + '\n');
        }
      }
      res.json({"path": data.path, "mats": data["Matériaux"]});
    });

    pyshell.end(function (err) {
      if (err){
        throw err;
      }
      console.log('finished in '+ Math.floor((Date.now() - timer)/1000) + 's.');
    });
  })
});

router.post('/jsonpath', Storage.upload.single('jsonpath'), (req, res, next) => {
  if (req.file !== undefined) {
    const myPath = Path.resolve(req.file.path);
    const content = JSON.parse(Fs.readFileSync(myPath));
    res.json(content);
    Fs.unlink(myPath, (err) => {
      if (err) throw err;
      console.log('deleted');
    });
  }
  else {
    console.log("File not found")
  }
});


module.exports.router = router;
