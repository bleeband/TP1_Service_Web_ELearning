```
    Le projet backend est en modules ES ("type": "module" dans package.json). C’est pour cela que les imports internes se terminent par .js (ex. ./routes/auth.routes.js), même si les fichiers sont en .ts.
```

# INITIALISATION 

1. npm install
2. npx tsc --init
3. npx prisma init (si nouveau projet)
4. npx prisma migrate dev --name init (si nouveau projet)
5. npx prisma generate


# Étape 1 — # Production

npm install express dotenv @prisma/client @prisma/adapter-neon axios bcryptjs jsonwebtoken cors

# Étape 2 — # Developpement

npm install --save-dev typescript tsx prisma @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors

```
Paquet                          Rôle
express                         l’API REST
@prisma/client + prisma         l’ORM (requêtes + migrations)
@prisma/adapter-neon            connecter Prisma à Neon
axios                           appeler la PokéAPI
bcryptjs                        hacher les mots de passe
jsonwebtoken                    signer / vérifier les JWT
inittsx                         exécuter le TypeScript (dev)
```

# Étape 3 — Configurer TypeScript

npx tsc --init

Dans tsconfig.json, l’essentiel (projet ES modules) :

# Étape 4 — Neon + variables d’environnement

Sur https://neon.tech, créez un projet et copiez la chaîne de connexion.

Créez .env :

- DATABASE_URL="postgresql://utilisateur:motdepasse@hote.neon.tech/nomdb?sslmode=require"
- JWT_SECRET="changez_moi_par_une_longue_chaine_aleatoire"
- PORT=3000

Générez un secret : 
- node -e "console.log(require(’crypto’).randomBytes(32).toString(’hex’))"

Initialisez Prisma : 
- npx prisma init

Prisma crée un fichier prisma.config.ts qui fournit l’URL à la CLI :
```
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
schema: "prisma/schema.prisma",
migrations: { path: "prisma/migrations" },
datasource: { url: process.env["DATABASE_URL"] },
})
```

# Étape 5 — Le schéma Prisma

Construire le schéma Prisma

# Étape 6 — Migration + client Prisma

npx prisma migrate dev --name init

npx prisma generate

Créez le singleton utils/prisma.ts (adaptateur Neon) :

```
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../generated/prisma/client.js"
import dotenv from "dotenv"
dotenv.config()

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

const prisma = new PrismaClient({
adapter,
log: ["query", "info", "warn", "error"],
})

export default prisma
```

L’import du client vient de ../generated/prisma/client.js (dossier output), pas de
@prisma/client. Le .js est requis car le projet est en modules ES.

# Étape 7 — L’instance Axios pour l'API

Créez src/api/nomapi.ts :
```
import axios from "axios"

export const NOM_DE_API = axios.create({
baseURL: "https://URL_DE_L'API",
timeout: 5000,
})
```
# Étape 8 — Le middleware JWT
Créez src/middleware/auth.ts :
```
import { type Request, type Response, type NextFunction } from "express"
import dotenv from "dotenv"
dotenv.config()
import jwt from "jsonwebtoken"

// authN : verifier le token
export function authentifier(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization // "Bearer xxx.yyy.zzz"
    if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ erreur: "Token manquant" })
    }
    const token = header.split(" ")[1]
    try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!)
    ;(req as any).user = payload
    next()
    } catch {
    res.status(401).json({ erreur: "Token invalide / expire" })
    }
}

// authZ : exiger un role
export function exigerRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user.role !== role) {
    return res.status(403).json({ erreur: "acces refuse" })
    }
    next()
    }
}
```
Le point-virgule devant ;(req as any)... est important. Sans lui, JavaScript colle la
ligne à la précédente et interprète jwt.verify(...)(req as any) comme un appel de fonction.
Le ; en début de ligne coupe ce piège (insertion automatique de point-virgule).

# Étape 9 — Les routes

Créez src/routes/auth.routes.ts

# Étape 10 — Les routes de la DataBase

Créez src/routes/nomdelaroute.routes.ts. C’est le coeur du projet : on récupère un information X
depuis la nomapi (Axios), on le transforme, on l’enregistre (Prisma).

Concepts : instance Axios, transformation (?., ??), isAxiosError, create/findMany/update
Prisma, et RBAC (le PATCH est réservé au rôle ADMIN).


# Étape 11 — Le serveur (avec CORS)
Créez src/server.ts. Le cors est indispensable pour que le frontend (port 5173) puisse
appeler l’API (port 3000).
```
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import route..... from "./routes/nomroute.routes.js"
import routerAuth from "./routes/auth.routes.js"
dotenv.config()

const app = express()
app.use(cors()) // autorise le frontend a appeler l’API
app.use(express.json())

app.use("/auth", routerAuth)
app.use("/database", routeDataBase)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
console.log(‘Serveur sur le http://localhost:${PORT}/‘)
})
```

# Étape 12 — Lancer et tester le backend

npm run dev

Testez avec un fichier test.rest (extension REST Client) :
### Liste depuis la nomapi
GET http://localhost:3000/

### Capturer un information X
POST http://localhost:3000/