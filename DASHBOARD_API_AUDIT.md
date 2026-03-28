# Dashboard & Tabs API Usage Audit

## 🔍 **CURRENT STATUS**

### ❌ **ISSUES FOUND**

#### 1. **Dashboard Endpoints NOT Being Used**
We added these new endpoints but dashboards are NOT using them:

| Dashboard | New Endpoint Available | Currently Using | Status |
|-----------|----------------------|-----------------|--------|
| **Admin** | `apiService.adminDashboard()` | Manual calculation from `getSubmissions()`, `getEmployees()` | ❌ Not using |
| **Evaluator** | `apiService.evaluatorDashboard()` | Manual calculation from `getSubmissions()` | ❌ Not using |
| **HR** | `apiService.hrDashboard()` | Manual calculation from `getSubmissions()`, `getEmployees()` | ❌ Not using |
| **Employee** | `apiService.employeeDashboard()` | Manual calculation from `getSubmissions()` | ❌ Not using |

#### 2. **Evaluation Endpoints NOT Being Used**
We added these endpoints but components are NOT using them:

| Component | New Endpoint Available | Currently Using | Status |
|-----------|----------------------|-----------------|--------|
| **Evaluator Dashboard** | `apiService.getEvalAuthEvaluator()` | `getSubmissions()` + filtering by `evaluatorId` | ❌ Not using |
| **Employee Dashboard** | `apiService.getMyEvalAuthEmployee()` | `getSubmissions()` + filtering by email | ❌ Not using |

#### 3. **User Management Endpoints NOT Being Used**
We added these endpoints but may not be used:

| Endpoint | Should Be Used In | Currently Using | Status |
|----------|------------------|-----------------|--------|
| `getAllUsers()` | Admin tabs | `getActiveRegistrations()` or `getEmployees()` | ⚠️ Check needed |
| `getAllBranchHeads()` | Branch Heads Tab | `getEmployees()` + filtering | ⚠️ Check needed |
| `getAllAreaManager()` | Area Managers Tab | `getEmployees()` + filtering | ⚠️ Check needed |
| `getAllEmployeeByAuth()` | Various tabs | `getEmployees()` + filtering | ⚠️ Check needed |

---

## 📋 **DETAILED FINDINGS**

### **Admin Dashboard** (`src/app/admin/page.tsx`)
**Current Implementation:**
- ✅ Uses `apiService.getSubmissions()` - Correct
- ✅ Uses `apiService.getEmployees()` - Correct
- ✅ Uses `apiService.getAccounts()` - Correct
- ✅ Uses `apiService.getPendingRegistrations()` - Correct
- ❌ **NOT using** `apiService.adminDashboard()` - Should use for dashboard cards/metrics
- ❌ Manually calculating metrics from multiple API calls

**Should Update:**
- Use `apiService.adminDashboard()` for dashboard summary cards instead of manual calculation

---

### **Evaluator Dashboard** (`src/app/evaluator/page.tsx`)
**Current Implementation:**
- ✅ Uses `apiService.getSubmissions()` - Correct
- ❌ **NOT using** `apiService.getEvalAuthEvaluator()` - Should use this instead
- ❌ **NOT using** `apiService.evaluatorDashboard()` - Should use for dashboard cards
- ❌ Manually filtering submissions by `evaluatorId` - Backend should do this

**Should Update:**
- Replace `getSubmissions()` + filter with `getEvalAuthEvaluator()`
- Use `apiService.evaluatorDashboard()` for dashboard summary cards

---

### **HR Dashboard** (`src/app/hr-dashboard/page.tsx`)
**Current Implementation:**
- ✅ Uses `apiService.getSubmissions()` - Correct
- ✅ Uses `apiService.getEmployees()` - Correct
- ✅ Uses `apiService.getBranches()` - Correct
- ✅ Uses `apiService.getPositions()` - Correct
- ❌ **NOT using** `apiService.hrDashboard()` - Should use for dashboard cards
- ❌ Manually calculating metrics from multiple API calls

**Should Update:**
- Use `apiService.hrDashboard()` for dashboard summary cards instead of manual calculation

---

### **Employee Dashboard** (`src/app/employee-dashboard/page.tsx`)
**Current Implementation:**
- ✅ Uses `apiService.getSubmissions()` - Correct
- ❌ **NOT using** `apiService.getMyEvalAuthEmployee()` - Should use this instead
- ❌ **NOT using** `apiService.employeeDashboard()` - Should use for dashboard cards
- ❌ Manually filtering submissions by email - Backend should do this

**Should Update:**
- Replace `getSubmissions()` + filter with `getMyEvalAuthEmployee()`
- Use `apiService.employeeDashboard()` for dashboard summary cards

---

### **Admin Tabs**

#### **User Management Tab** (`src/app/admin/UserManagementTab/index.tsx`)
- ✅ Uses `apiService.getPendingRegistrations()` - Correct
- ✅ Uses `apiService.getActiveRegistrations()` - Correct
- ⚠️ Could use `apiService.getAllUsers()` instead of `getActiveRegistrations()` - Check if same

#### **Branch Heads Tab** (`src/app/admin/BranchHeadsTab/index.tsx`)
- ⚠️ Check if using `apiService.getAllBranchHeads()` or still filtering manually

#### **Area Managers Tab** (`src/app/admin/AreaManagersTab/index.tsx`)
- ⚠️ Check if using `apiService.getAllAreaManager()` or still filtering manually

---

## 🎯 **RECOMMENDATIONS**

### **Priority 1: Use Dashboard Endpoints**
Replace manual metric calculations with dedicated dashboard endpoints:
1. Admin Dashboard → Use `apiService.adminDashboard()`
2. Evaluator Dashboard → Use `apiService.evaluatorDashboard()`
3. HR Dashboard → Use `apiService.hrDashboard()`
4. Employee Dashboard → Use `apiService.employeeDashboard()`

**Benefits:**
- Single API call instead of multiple
- Backend handles calculations
- Consistent data format
- Better performance

### **Priority 2: Use Role-Specific Evaluation Endpoints**
Replace manual filtering with role-specific endpoints:
1. Evaluator → Use `apiService.getEvalAuthEvaluator()` instead of `getSubmissions()` + filter
2. Employee → Use `apiService.getMyEvalAuthEmployee()` instead of `getSubmissions()` + filter

**Benefits:**
- Backend handles filtering
- More secure (only returns user's data)
- Better performance
- Cleaner code

### **Priority 3: Use User Management Endpoints**
Check and update tabs to use specific user endpoints:
1. Branch Heads Tab → Use `apiService.getAllBranchHeads()`
2. Area Managers Tab → Use `apiService.getAllAreaManager()`
3. User Management → Consider `apiService.getAllUsers()` vs `getActiveRegistrations()`

---

## ✅ **ACTION ITEMS**

- [ ] Update Admin Dashboard to use `apiService.adminDashboard()`
- [ ] Update Evaluator Dashboard to use `apiService.evaluatorDashboard()` and `getEvalAuthEvaluator()`
- [ ] Update HR Dashboard to use `apiService.hrDashboard()`
- [ ] Update Employee Dashboard to use `apiService.employeeDashboard()` and `getMyEvalAuthEmployee()`
- [ ] Check Branch Heads Tab for `getAllBranchHeads()` usage
- [ ] Check Area Managers Tab for `getAllAreaManager()` usage
- [ ] Verify User Management Tab endpoint usage

---

## 📝 **NOTES**

- All endpoints are ready in `apiService.ts`
- Need to update dashboard components to use them
- This will improve performance and reduce API calls
- Backend will handle filtering/calculations instead of frontend

---

**Status**: ⚠️ **AUDIT COMPLETE - UPDATES NEEDED**

