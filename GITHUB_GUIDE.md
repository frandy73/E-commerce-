# Kijan pou mete ajou GitHub ou 🚀

Ou te telechaje pwojè a epi ou fè modifikasyon sou li. Kounye a li lè pou voye l sou GitHub. Piske ou pa gen `git` konfigire nan dosye sa a ankò (ou te jis telechaje l), men sa pou w fè:

## Etap 1: Inisyalize Git

Ale nan tèminal ou a (kote ou tap tape `npm run dev` la) epi tape kòmand sa yo youn apre lòt:

```bash
# 1. Kanpe aplikasyon an si l ap mache (Ctrl + C)

# 2. Inisyalize git
git init

# 3. Ajoute tout fichye yo
git add .

# 4. Anrejistre chanjman yo
git commit -m "Gwo mizajou: Admin Panel, Supabase Storage, Chat Assistant"
```

## Etap 2: Konekte li ak GitHub ou

Ou bezwen lyen (URL) repo GitHub ou a. Li sanble ak: `https://github.com/NON_ITILIZATÈ/NON_REPO.git`.

⚠️ **Ranplase `LYEN_REPO_OU_A` anba a ak lyen pa w la:**

```bash
# 5. Chanje branch lan an 'main'
git branch -M main

# 6. Ajoute GitHub ou kòm remote (DESTINASYON)
# Ranplase URL la ak pa w la!
git remote add origin https://github.com/Frandy005/E-commerce-.git

# 7. Voye chanjman yo (Si se premye fwa)
git push -u origin main --force
```

> **Nòt enpòtan**: Si ou jwenn yon erè lè w ap fè `git remote add` ki di "remote origin already exists", sa vle di li deja la. Jis sote etap sa a epi fè etap 7 la.

## Rezime pou pwochen fwa yo

Apre w fin fè konfigirasyon sa a, chak fwa ou vle sove chanjman ou yo:

1. `git add .`
2. `git commit -m "Mesaj sou sa w fè a"`
3. `git push`

Sa fini! 🎉
