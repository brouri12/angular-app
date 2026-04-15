# TODO.md - RBAC ✅ Complété !

## Statut: ✅ TERMINÉ

**Fonctionnalités** :
1. ✅ `auth.service.ts` (roles signals).
2. ✅ Header menus statiques (visible).
3. ✅ Guards routes `/student`/`tuteur`.
4. ✅ Keycloak SSO (init true).
5. ✅ Compilation OK (ng serve fonctionne).

**Test** :
```
ng serve → localhost:4200 → Header + Home + Login Keycloak → Navigation.

**RBAC dynamique** : Assigner rôles → Revert header.ts navLinks = computed().

**Guards** : Bloquent accès wrong role.

## Next
Keycloak users: Role `student`/`tuteur` → Refresh.

