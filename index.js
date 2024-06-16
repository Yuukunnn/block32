import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import chalk from 'chalk';
import cors from 'cors';

dotenv.config();

//set up server with using express:
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(chalk.green(`server successfully listening on port ${port}`));
});

//set up DB with using pg:
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_IceCream');
const init = async () => {
  await client.connect();
  const SQL = `
    DROP TABLE IF EXISTS ice_cream;
    CREATE TABLE ice_cream(
        id SERIAL PRIMARY KEY,
        flavor_name VARCHAR(255),
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    );
    INSERT INTO ice_cream(flavor_name, is_favorite) VALUES('Mongo Cats', false);
    INSERT INTO ice_cream(flavor_name, is_favorite) VALUES('Lemon Grassplay', true);
    INSERT INTO ice_cream(flavor_name, is_favorite) VALUES('Penut Butter Slime', true);
    INSERT INTO ice_cream(flavor_name, is_favorite) VALUES('Pumpkin Break', false);
    INSERT INTO ice_cream(flavor_name, is_favorite) VALUES('Bloody Coffee', true);
    `;
  await client.query(SQL);
  console.log(chalk.green('table created && data seeded!!'));
};
init();

//app routes:
app.get('/api/flavors', (req, res) => {
  const SQL = `
    SELECT * FROM ice_cream;
    `;
  client
    .query(SQL)
    .then((response) => {
      res.send(response.rows);
    })
    .catch((error) => {
      console.log(chalk.red(error));
    });
});

app.get('/api/flavors/:id', async (req, res) => {
  const SQL = `
    SELECT * FROM ice_cream WHERE id = $1
    `;
  client
    .query(SQL, [req.params.id])
    .then((response) => {
      res.send(response.rows);
    })
    .catch((error) => {
      console.log(chalk.red(error));
    });
});

app.post('/api/flavors', async (req, res) => {
  const SQL = `
    INSERT INTO ice_cream(flavor_name, is_favorite) VALUES($1, $2) RETURNING *;
    `;
  client
    .query(SQL, [req.body.flavor_name, req.body.is_favorite])
    .then((response) => {
      res.send(response.rows);
    })
    .catch((error) => {
      console.log(chalk.red(error));
    });
});

app.put('/api/flavors/:id', async (req, res) => {
  const SQL = `UPDATE ice_cream SET flavor_name=$1, is_favorite=$2, updated_at=now()
    WHERE id=$3 RETURNING *;
    `;
  client
    .query(SQL, [req.body.flavor_name, req.body.is_favorite, req.params.id])
    .then((response) => {
      res.send(response.rows);
    })
    .catch((error) => {
      console.log(chalk.red(error));
    });
});

app.delete('/api/flavors/:id', async (req, res) => {
  const SQL = `
    DELETE FROM ice_cream WHERE id=$1 RETURNING *;
    `;
  client
    .query(SQL, [req.params.id])
    .then((response) => {
      res.send(response.rows);
    })
    .catch((error) => {
      console.log(chalk.red(error));
    });
});
