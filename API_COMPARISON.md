# API Endpoints Comparison

## 📊 Comparison: Documentation vs Current Implementation

### ✅ **CORRECTLY IMPLEMENTED** (Matches Documentation)

| Documentation | Current Implementation | Status |
|--------------|------------------------|--------|
| `POST /api/register` | `POST /register` | ⚠️ Missing `/api` prefix |
| `POST /api/login` | `POST /login` | ⚠️ Missing `/api` prefix |
| `GET /api/positions` | `GET /positions` | ⚠️ Missing `/api` prefix |
| `GET /api/branches` | `GET /branches` | ⚠️ Missing `/api` prefix |
| `GET /api/departments` | `GET /departments` | ⚠️ Missing `/api` prefix |
| `GET /api/profile` | `GET /profile` | ⚠️ Missing `/api` prefix |
| `GET /api/getAllActiveUsers` | `GET /getAllActiveUsers` | ⚠️ Missing `/api` prefix |
| `GET /api/getPendingRegistrations` | `GET /getPendingRegistrations` | ⚠️ Missing `/api` prefix |
| `POST /api/updateUser/{user}` | `POST /update_user/{id}` | ⚠️ Wrong path format |
| `POST /api/approveRegistration/{user}` | `POST /approveRegistration/{id}` | ⚠️ Missing `/api` prefix |
| `POST /api/rejectRegistration/{user}` | `POST /rejectRegistration/{id}` | ⚠️ Missing `/api` prefix |
| `DELETE /api/deleteUser/{user}` | `POST /delete_user/{id}` | ⚠️ Wrong method (should be DELETE) |
| `GET /api/allEvaluations` | `GET /allEvaluations` | ⚠️ Missing `/api` prefix |
| `POST /api/logout` | `POST /logout` | ⚠️ Missing `/api` prefix |

---

### ⚠️ **NEEDS FIXING** (Wrong Path/Method)

| Documentation | Current Implementation | Issue |
|--------------|------------------------|-------|
| `POST /api/updateUser/{user}` | `POST /update_user/{id}` | Wrong path: should be `/api/updateUser/{user}` |
| `DELETE /api/deleteUser/{user}` | `POST /delete_user/{id}` | Wrong method: should be DELETE, wrong path |
| `GET /api/submissions/{usersEvaluation}` | `GET /submissions/{id}` | Missing `/api` prefix |
| `POST /api/submit/{user}` | `POST /submissions` | Wrong path: should be `/api/submit/{user}` |
| `DELETE /api/delete_eval/{usersEvaluation}` | `DELETE /submissions/{id}` | Wrong path: should be `/api/delete_eval/{usersEvaluation}` |
| `POST /api/uploadAvatar` | `POST /upload_avatar` | Wrong path: should be `/api/uploadAvatar` |
| `POST /api/updateProfileUserAuth` | `POST /update_employee_auth` | Wrong path: should be `/api/updateProfileUserAuth` |

---

### ❌ **MISSING ENDPOINTS** (Not Implemented)

#### User Management
- `GET /api/getAllUsers` - Get all users (except authenticated)
- `GET /api/getAllBranchHeads` - Get all branch heads/supervisors
- `GET /api/getAllAreaManager` - Get all area managers
- `GET /api/getAllEmployeeByAuth` - Get employees under authenticated user
- `GET /api/showUser/{user}` - Get specific user
- `POST /api/addUser` - Add new user
- `POST /api/updateUserBranch/{user}` - Update branches for user
- `POST /api/removeUserBranches/{user}` - Remove all assigned branches

#### Evaluations
- `GET /api/getEvalAuthEvaluator` - Get evaluations by authenticated evaluator
- `GET /api/getMyEvalAuthEmployee` - Get evaluations by authenticated employee
- `POST /api/approvedByEmployee/{usersEvaluation}` - Approve evaluation by employee

#### Branches
- `GET /api/getTotalEmployeesBranch` - Get total employees under branch
- `GET /api/branch/{branch}` - Get specific branch
- `POST /api/addBranch` - Add new branch

#### Departments
- `GET /api/getTotalEmployeesDepartments` - Get total employees under department
- `POST /api/addDepartment` - Add new department
- `DELETE /api/deleteDepartment/{department}` - Delete department

#### Dashboards
- `GET /api/adminDashboard` - Admin dashboard total cards
- `GET /api/evaluatorDashboard` - Evaluator dashboard total cards
- `GET /api/hrDashboard` - HR dashboard total cards
- `GET /api/employeeDashboard` - Employee dashboard total cards

#### Other
- `GET /api/getAllRoles` - Get all roles
- `POST /api/isReadNotification` - Mark notification as read

---

### 🔍 **EXTRA ENDPOINTS** (In Code But Not in Docs)

These are in `apiService.ts` but not in your documentation:
- `GET /api/accounts` - Get accounts
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/{id}` - Get profile by ID
- `PUT /api/profiles/{id}` - Update profile
- `GET /api/users/{userId}` - Get user by ID
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count
- `DELETE /api/notifications/{id}` - Delete notification
- `PATCH /submissions/{id}/employee-approve` - Employee approval (custom)
- `PATCH /submissions/{id}/evaluator-approve` - Evaluator approval (custom)
- `PATCH /submissions/bulk-approve` - Bulk approve (custom)
- `PATCH /submissions/{id}/approval-status` - Update approval status (custom)

**Note**: These might be custom implementations or endpoints not yet documented.

---

## 📋 **SUMMARY**

### Issues Found:
1. **Missing `/api` prefix** - Most endpoints are missing the `/api` prefix
2. **Wrong path formats** - Some paths use different naming (e.g., `update_user` vs `updateUser`)
3. **Wrong HTTP methods** - `deleteUser` uses POST instead of DELETE
4. **Missing endpoints** - 20+ endpoints from documentation are not implemented

### Action Items:
1. Add `/api` prefix to all endpoints
2. Fix path formats to match documentation
3. Fix HTTP methods (DELETE for deleteUser)
4. Implement missing endpoints
5. Verify extra endpoints with backend team

---

## 🎯 **NEXT STEPS**

Would you like me to:
1. Fix all the endpoint paths to match documentation?
2. Add all missing endpoints?
3. Fix HTTP methods?
4. Do all of the above?

Let me know and I'll proceed! 🚀

