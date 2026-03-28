# Backend Fix Required: Signature Field in Profile Endpoint

## Problem Summary

The signature is being saved successfully to the database, but it's not being returned when fetching the user profile. This causes the signature to disappear from the frontend after a profile refresh.

## Current Behavior

1. ✅ Frontend sends signature to `/updateProfileUserAuth` endpoint
2. ✅ Backend saves signature to database (returns success)
3. ❌ Backend `/profile` endpoint does NOT return the `signature` field
4. ❌ Frontend loses signature after `refreshUser()` is called

## Backend Fix Required

### Endpoint: `GET /profile`

The `/profile` endpoint (used by `apiService.authUser()`) needs to include the `signature` field in its response.

**Current Response (Missing Signature):**
```json
{
  "id": 1,
  "username": "hr_admin",
  "fname": "HR",
  "lname": "Administrator",
  "email": "hr@smct.com",
  "position": "HR Manager",
  "department": "Human Resources",
  "branch": "Main Branch",
  "avatar": "path/to/avatar.jpg",
  "bio": "Bio text here",
  "isActive": true
  // ❌ signature field is missing
}
```

**Expected Response (With Signature):**
```json
{
  "id": 1,
  "username": "hr_admin",
  "fname": "HR",
  "lname": "Administrator",
  "email": "hr@smct.com",
  "position": "HR Manager",
  "department": "Human Resources",
  "branch": "Main Branch",
  "avatar": "path/to/avatar.jpg",
  "bio": "Bio text here",
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAj0AAACACAYAAA...",  // ✅ Include this field
  "isActive": true
}
```

### Implementation Steps

1. **Update the User Model/Controller** to include `signature` in the profile response
2. **Ensure the signature field is selected** when fetching user data for the profile endpoint
3. **Verify the signature is included** in the JSON response

### Example Backend Code (Laravel/PHP)

```php
// In your ProfileController or UserController
public function profile(Request $request)
{
    $user = $request->user();
    
    return response()->json([
        'id' => $user->id,
        'username' => $user->username,
        'fname' => $user->fname,
        'lname' => $user->lname,
        'email' => $user->email,
        'position' => $user->position,
        'department' => $user->department,
        'branch' => $user->branch,
        'avatar' => $user->avatar,
        'bio' => $user->bio,
        'signature' => $user->signature,  // ✅ Add this line
        'isActive' => $user->isActive,
        // ... other fields
    ]);
}
```

### Example Backend Code (Node.js/Express)

```javascript
// In your profile route
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+signature'); // Include signature
    
    res.json({
      id: user.id,
      username: user.username,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      position: user.position,
      department: user.department,
      branch: user.branch,
      avatar: user.avatar,
      bio: user.bio,
      signature: user.signature,  // ✅ Include this field
      isActive: user.isActive,
      // ... other fields
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});
```

## Frontend Workaround (Temporary)

Currently, the frontend has a workaround in place:

- **Location**: `src/components/DashboardShell.tsx` → `handleSaveProfile()`
- **Location**: `src/contexts/UserContext.tsx` → `updateUserField()`

This workaround manually preserves the signature in the user context after saving, even though the backend doesn't return it. This ensures the signature persists in the frontend until the backend is fixed.

**Once the backend is fixed**, this workaround can be removed:
- Remove the `updateUserField` call in `DashboardShell.tsx`
- Optionally remove the `updateUserField` function from `UserContext.tsx` if not used elsewhere

## Testing the Fix

After implementing the backend fix:

1. **Save a signature** in the profile modal
2. **Check the browser console** - you should see:
   ```
   🔄 User data refreshed from API: {
     hasSignature: true,  // ✅ Should be true
     signatureLength: 6070,  // ✅ Should have a value
     signaturePreview: "data:image/png;base64,..."  // ✅ Should show preview
   }
   ```
3. **Refresh the page** - the signature should still be visible
4. **Reopen the profile modal** - the signature should be displayed

## Verification Checklist

- [ ] `/profile` endpoint includes `signature` field in response
- [ ] Signature persists after page refresh
- [ ] Signature is visible in profile modal after refresh
- [ ] Console logs show `hasSignature: true` after refresh
- [ ] Frontend workaround can be removed

## Related Files

- **Frontend API Service**: `src/lib/apiService.ts` → `authUser()` method
- **Frontend User Context**: `src/contexts/UserContext.tsx` → `refreshUser()` method
- **Frontend Profile Modal**: `src/components/ProfileModal.tsx` → `handleSubmit()` method
- **Frontend Dashboard Shell**: `src/components/DashboardShell.tsx` → `handleSaveProfile()` method

## Notes

- The signature is stored as a base64 data URL string (e.g., `"data:image/png;base64,..."`)
- Signature length can vary (typically 2000-10000+ characters)
- The signature field should be nullable/optional (users may not have a signature)
- Ensure the signature field is included in the database schema and migrations

