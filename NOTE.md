# Working with branches

## 1. Develop branches

- Root branch: `develop`.
- feature & fix branches start with a verb. E.g. `develop/do-stiff`, `develop/fix-butterfly`


## 2. Deploy branches

### development environments

- `release/uat`: testing new feature (using local VM)

### production environments

- `release/v<number>`: launching on production - shipped application


## 3. About main branch

Only for public archive and rollback purpose - code must be tested carefully before being merged