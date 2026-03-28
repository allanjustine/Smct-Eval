 # Evaluation-2 Alignment Tasks
## Items that need to match between `evaluation` and `evaluation-2` components

**Created:** For Monday's work session  
**Status:** Pending implementation

---

## 🔴 HIGH PRIORITY

### 1. **Employee Prop Structure**
**Current Issue:** evaluation-2 uses simplified object, evaluation uses full `User` object

**evaluation (current):**
```tsx
employee?: User | null;
// Can access: employee?.departments?.department_name
```

**evaluation-2 (needs change):**
```tsx
employee?: {
  id: number;
  name: string;
  department: string; // Already extracted
  ...
}
```

**Action Required:**
- Change evaluation-2 to accept full `User | null` object
- Update all Step components to use `employee?.departments?.department_name` pattern
- Keep fallback to `employee.department` for backward compatibility

**Files to Update:**
- `src/components/evaluation-2/index.tsx` (interface)
- `src/components/evaluation-2/Step1.tsx` through `Step8.tsx`
- `src/components/evaluation-2/OverallAssessment.tsx`
- `src/components/evaluation-2/WelcomeStep.tsx`

---

### 2. **Score Data Types**
**Current Issue:** evaluation-2 uses `string`, evaluation uses `number`

**evaluation (current):**
```tsx
jobKnowledgeScore1: number;
// Stored as: Number(value)
```

**evaluation-2 (needs change):**
```tsx
jobKnowledgeScore1: string;
// Stored as: value (string)
```

**Action Required:**
- Change all score fields in `types.ts` from `string` to `number`
- Update ScoreDropdown handlers to convert: `Number(value)`
- Update validation logic to check for `0` instead of `''`
- Update average calculations to work with numbers

**Files to Update:**
- `src/components/evaluation-2/types.ts`
- All Step components (Step1.tsx through Step8.tsx)
- `src/components/evaluation-2/index.tsx` (validation logic)

---

### 3. **Coverage Date Validation**
**Current Issue:** evaluation-2 missing detailed date validation

**evaluation (has this):**
```tsx
const hasValidCoverageDates = (() => {
  // Validates date format (YYYY-MM-DD, length === 10)
  // Validates fromDate < toDate
  // Validates fromDate >= hireDate
})();
```

**evaluation-2 (needs this):**
- Currently has basic validation but missing:
  - Date format validation (length check)
  - Proper date comparison logic
  - Hire date validation

**Action Required:**
- Add `hasValidCoverageDates` function to `index.tsx`
- Include in Step 1 validation check
- Ensure same validation logic as evaluation

**Files to Update:**
- `src/components/evaluation-2/index.tsx` (isCurrentStepComplete function)

---

## 🟡 MEDIUM PRIORITY

### 4. **Quarterly Review Checking Method**
**Current Issue:** Different methods used

**evaluation:**
```tsx
await apiService.getQuarters(Number(employee.id));
```

**evaluation-2:**
```tsx
await getQuarterlyReviewStatus(employee.id, getCurrentYear());
```

**Action Required:**
- Standardize to use same method (prefer `apiService.getQuarters()`)
- Update Step1.tsx in evaluation-2

**Files to Update:**
- `src/components/evaluation-2/Step1.tsx`

---

### 5. **Score Conversion on Save**
**Current Issue:** evaluation-2 stores strings, should store numbers

**evaluation:**
```tsx
onValueChange={(value) => 
  updateDataAction({ jobKnowledgeScore1: Number(value) })
}
```

**evaluation-2:**
```tsx
onValueChange={(value) => 
  updateDataAction({ jobKnowledgeScore1: value }) // string
}
```

**Action Required:**
- Update all ScoreDropdown `onValueChange` handlers
- Convert string to number before storing

**Files to Update:**
- All Step components (Step1.tsx through Step8.tsx)

---

### 6. **Average Score Calculation**
**Current Issue:** Different filtering logic

**evaluation:**
```tsx
.filter((score) => score && score !== 0)
```

**evaluation-2:**
```tsx
.filter(score => score && score !== '')
```

**Action Required:**
- Change to filter `!== 0` once scores are numbers
- Update calculation logic in all Step components

**Files to Update:**
- All Step components with average calculations

---

## 🟢 LOW PRIORITY

### 7. **UI/UX Consistency**
- Button hover colors (already fixed: `hover:bg-green-600`)
- Tooltip messages wording
- Validation message specificity

### 8. **Review Type Structure**
**Note:** This is intentionally different:
- evaluation: Single field with union types
- evaluation-2: Multiple boolean flags

**Decision Needed:** Keep as-is or refactor to match?

---

## 📋 Implementation Checklist

### Phase 1: Data Types & Structure
- [ ] Change score types from `string` to `number` in `types.ts`
- [ ] Update employee prop to accept `User | null`
- [ ] Update all Step components to use number types
- [ ] Update ScoreDropdown handlers to convert to numbers

### Phase 2: Validation
- [ ] Add `hasValidCoverageDates` validation
- [ ] Update Step 1 validation to include date validation
- [ ] Update average score calculations to use number filtering

### Phase 3: Consistency
- [ ] Standardize quarterly review checking method
- [ ] Ensure employee object access pattern matches
- [ ] Review and align validation messages

### Phase 4: Testing
- [ ] Test all score inputs work correctly
- [ ] Test date validation works properly
- [ ] Test employee data syncing
- [ ] Test form submission with all data types

---

## 📝 Notes

1. **Step Structure Difference:** evaluation-2 has Step 8 (Managerial Skills) which evaluation doesn't have. This is intentional and should remain.

2. **Review Type Structure:** The boolean flags vs union types is a design decision. If keeping boolean flags, ensure proper data mapping on submission.

3. **Backward Compatibility:** When changing employee prop, ensure existing code that passes simplified objects still works (use fallbacks).

---

## 🔗 Related Files

**Main Components:**
- `src/components/evaluation/index.tsx`
- `src/components/evaluation-2/index.tsx`
- `src/components/evaluation/types.ts`
- `src/components/evaluation-2/types.ts`

**Step Components:**
- `src/components/evaluation/Step1.tsx` → `src/components/evaluation-2/Step1.tsx`
- (Repeat for Steps 2-7, plus Step8 in evaluation-2)

**Parent Components (pass employee data):**
- `src/app/evaluator/employees/page.tsx`
- `src/app/hr-dashboard/userManagement/page.tsx`

---

**Ready for Monday! 🚀**

