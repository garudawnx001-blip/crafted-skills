# Crafted Skills

Website and learning platform for **Crafted Skills** – learn digital skills in Kannada (Karnataka).

- Public site: home, course bundles, bundle pages, affiliate program, about, contact, terms
- Accounts: learner, affiliate and trainer sign-up / login, forgot password
- Dashboards: learner (my learning, player, purchases, certificates), affiliate (earnings, links, referrals, leaderboard, payouts), trainer studio, admin
- Checkout: Razorpay-style test checkout (no money charged)

**Preview mode:** accounts and orders are stored in the visitor's browser until the database (Supabase) and live Razorpay are connected.

## Develop

```bash
npm install
npm run dev      # local
npm run build    # production build in dist/
```

Stack: React 19 + TypeScript + Vite. Hosted on GitHub Pages from the `gh-pages` branch.
