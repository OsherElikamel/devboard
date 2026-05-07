# Git and GitHub — The Full Picture

A beginner-friendly guide explaining how Git, GitHub, GitHub CLI, authentication, and credentials all fit together.

---

## The Three Layers

Think of it as three separate things that work together:

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Git (on your computer)                │
│  - Tracks file changes                          │
│  - Creates commits (snapshots of your code)     │
│  - Works 100% offline — no internet needed      │
│  - Knows nothing about GitHub                   │
└─────────────────────┬───────────────────────────┘
                      │ git push / git pull
┌─────────────────────▼───────────────────────────┐
│  Layer 2: GitHub (website)                      │
│  - Stores a copy of your repository online      │
│  - Adds collaboration features (PRs, issues)    │
│  - Makes your code accessible from anywhere     │
│  - Is just ONE option — GitLab, Bitbucket exist │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Layer 3: GitHub CLI (gh command)               │
│  - A convenience tool for talking to GitHub     │
│  - Creates repos, PRs, issues from terminal     │
│  - NOT required — you can do everything on the  │
│    GitHub website instead                        │
└─────────────────────────────────────────────────┘
```

---

## Git Username and Email — What They're For

When you make a commit, Git stamps it with a name and email:

```
commit cdd0da3
Author: OsherElikamel <oshercft@gmail.com>
Date:   Mon May 5 2026

    Initial release — DevBoard v1.0
```

That's all the Git username and email do — **they're a label on your commits.** They're set with:

```bash
git config user.name "OsherElikamel"
git config user.email "oshercft@gmail.com"
```

### Do they need to match your GitHub account?

Not technically — Git doesn't check. But GitHub uses the email to **link commits to your profile.** If the email matches your GitHub account, the commit shows your avatar and links to your profile. If it doesn't match, the commit shows as "unknown contributor."

So you want them to match for your commits to show up on your GitHub profile's contribution graph (the green squares).

### Local vs. global config

```bash
git config --global user.name "Name"    # Sets for ALL repos on your computer
git config user.name "Name"             # Sets for THIS repo only (overrides global)
```

Use `--global` for your primary identity. Use repo-level config when you need a different identity for a specific project (e.g., work vs. personal).

---

## Authentication — Who Can Push Where

There are two separate questions:

1. **Who is the author of this commit?** → answered by `git config user.name/email` (just a label, no verification)
2. **Who has permission to push to this repository?** → answered by **authentication**

Authentication is how GitHub knows it's really you. When you `git push`, GitHub asks: "prove you're allowed to write to this repo."

### Two ways to authenticate

**HTTPS (via GitHub CLI — what you're using):**
```
git push → GitHub CLI provides your login token → GitHub says "ok, you're OsherElikamel, allowed"
```

**SSH (the other option):**
```
git push → Your computer sends a cryptographic key → GitHub says "ok, that key belongs to OsherElikamel, allowed"
```

You're using HTTPS through the GitHub CLI. When you ran `gh auth login`, it stored a token on your computer that proves you're OsherElikamel. Every `git push` uses that token.

---

## What Affects What — The Cheat Sheet

| Action | What controls it |
|--------|-----------------|
| **Author name on commits** | `git config user.name` |
| **Author email on commits** | `git config user.email` |
| **Which GitHub account can push** | `gh auth` login (the authenticated token) |
| **Where code gets pushed to** | The remote URL (`git remote -v` shows it) |
| **Green squares on your GitHub profile** | Email in commits must match your GitHub account email |

---

## The Remote — Where Pushes Go

Your repo has a "remote" — a URL pointing to GitHub:

```bash
$ git remote -v
origin  https://github.com/OsherElikamel/devboard.git (fetch)
origin  https://github.com/OsherElikamel/devboard.git (push)
```

That `origin` is a nickname for the full URL. When you run `git push origin main`, it means "send my `main` branch to `https://github.com/OsherElikamel/devboard.git`."

---

## Multiple GitHub Accounts

If you have both a work and personal GitHub account:

### Check which account is active
```bash
gh auth status                    # Shows all logged-in accounts
gh api user --jq '.login'        # Shows which account will be used for pushes
```

### Switch between accounts
```bash
gh auth switch --user OsherElikamel   # Switch to personal
gh auth switch --user osher-paytag    # Switch to work
```

### Set the right identity for a repo
```bash
cd your-project
git config user.name "OsherElikamel"
git config user.email "oshercft@gmail.com"
```

This sets the commit author for that specific repo without affecting other repos.

---

## The Complete Mental Model

```
You edit files
    ↓
git add <files>              ← stage changes (pick what to include)
    ↓
git commit -m "message"      ← create a snapshot, stamped with your name/email
    ↓                           (this is LOCAL — nothing goes to GitHub yet)
git push origin main         ← send commits to GitHub
                                uses your gh auth token to prove identity
                                pushes to the URL stored in "origin"
```

---

## Essential Git Commands

| Command | What it does |
|---------|-------------|
| `git status` | Show what's changed since last commit |
| `git add <file>` | Stage a file for the next commit |
| `git add .` | Stage all changed files (be careful — check `git status` first) |
| `git commit -m "message"` | Create a commit with the staged changes |
| `git push` | Send commits to GitHub |
| `git pull` | Download new commits from GitHub |
| `git log --oneline -10` | Show last 10 commits |
| `git diff` | Show unstaged changes |
| `git remote -v` | Show where push/pull go |
| `git config user.name` | Check the commit author name |
| `git config user.email` | Check the commit author email |

---

## Summary

**Git** = local version control (tracks changes, creates commits, works offline).

**GitHub** = remote storage + collaboration (hosts repos, pull requests, issues).

**GitHub CLI** = convenience tool for GitHub (not required, but makes creating repos/PRs easier from terminal).

**Authentication** = proof of who you are when pushing (separate from commit author labels).

**Config name/email** = labels on commits (should match your GitHub email for profile linking).
