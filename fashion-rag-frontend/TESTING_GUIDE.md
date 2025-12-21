# Testing Guide - Fashion RAG Frontend

## 🧪 Testing the Refactored Components

### Prerequisites
```bash
# Make sure backend is running
cd fashion-rag-backend
uvicorn app:app --reload

# In another terminal, run frontend
cd fashion-rag-frontend
npm run dev
```

---

## ✅ Manual Testing Checklist

### 1. Text Search
- [ ] Enter text query "blue jeans"
- [ ] Click "Search Text" button
- [ ] Verify loading skeleton appears
- [ ] Verify results are displayed
- [ ] Verify toast notification appears
- [ ] Verify RAG text is generated
- [ ] Verify search is added to history

### 2. Image Search
- [ ] Click "Pilih Gambar" button
- [ ] Select an image file
- [ ] Verify image preview appears
- [ ] Click "Search Image" button
- [ ] Verify results are displayed
- [ ] Verify toast shows success message

### 3. AI Search
- [ ] Enter AI prompt "summer outfit"
- [ ] Click "Search AI" button
- [ ] Verify AI interprets prompt
- [ ] Verify relevant results appear
- [ ] Verify RAG recommendation is generated

### 4. Product Card
- [ ] Click on a product card
- [ ] Verify modal opens
- [ ] Verify product details are shown
- [ ] Press ESC key - modal should close
- [ ] Click outside modal - should close

### 5. Compare Mode
- [ ] Click "Compare" button
- [ ] Select 2-3 products
- [ ] Verify checkmarks appear
- [ ] Verify comparison view shows below
- [ ] Try selecting 4th item - should show error
- [ ] Click "Clear selection"

### 6. Filter & Sort
- [ ] Change sort to "Sort by Name"
- [ ] Verify products reorder alphabetically
- [ ] Select a category filter
- [ ] Verify only that category shows
- [ ] Change back to "All Categories"

### 7. Export
- [ ] Click "Export" button
- [ ] Verify JSON file downloads
- [ ] Open JSON file - verify data is correct

### 8. Search History
- [ ] Perform multiple searches
- [ ] Verify history updates
- [ ] Click a history item
- [ ] Verify form is populated
- [ ] Click "Clear" - history should empty

### 9. Theme Toggle
- [ ] Click theme toggle button
- [ ] Verify theme changes to light mode
- [ ] Verify all components adapt to light theme
- [ ] Toggle back to dark mode

### 10. Debug Panel
- [ ] Click "Debug" button
- [ ] Verify debug panel appears
- [ ] Verify statistics are shown
- [ ] Verify JSON preview appears
- [ ] Toggle off - panel should hide

### 11. Error Handling
- [ ] Stop backend server
- [ ] Try text search
- [ ] Verify error message appears
- [ ] Verify error toast shows
- [ ] Restart backend - search should work

### 12. Responsive Design
- [ ] Resize browser to mobile size
- [ ] Verify layout adapts
- [ ] Test all features on mobile view
- [ ] Verify touch interactions work

### 13. Tab Selector
- [ ] Click "Text" tab - shows text search form
- [ ] Click "Image" tab - shows image upload form
- [ ] Click "AI" tab - shows AI prompt form
- [ ] Active tab is highlighted correctly
- [ ] Description updates when switching tabs
- [ ] History items auto-switch to correct mode
- [ ] Works on mobile, tablet, desktop
- [ ] Keyboard navigation works (Tab key)
- [ ] Theme toggle affects tab colors

---

## 🔍 Component-Specific Tests

### TextSearch Component
```bash
Test Cases:
1. Empty input - should show required validation
2. Valid input - should trigger search
3. Loading state - button should show "Searching..."
4. Top K input - should accept numbers 1-20
```

### ImageSearch Component
```bash
Test Cases:
1. No file selected - should show error
2. Valid image file - should show preview
3. Non-image file - should handle gracefully
4. Large file - should handle upload
```

### AISearch Component
```bash
Test Cases:
1. Empty prompt - should show required validation
2. Long prompt - should handle textarea
3. Special characters - should handle properly
```

### ResultsGrid Component
```bash
Test Cases:
1. No results - should show empty state
2. Loading - should show skeleton
3. Results loaded - should render cards
4. Filter applied - should update grid
```

### Modal Component
```bash
Test Cases:
1. Click product - modal should open
2. ESC key - should close
3. Click outside - should close
4. Close button - should close
```

### Toast Component
```bash
Test Cases:
1. Success toast - green color
2. Error toast - red color
3. Info toast - default color
4. Auto-hide - should disappear after 3s
5. Manual close - click X to close
```

---

## 🐛 Known Issues & Solutions

### Issue 1: Module Not Found
```bash
Error: Cannot find module '@/components/...'

Solution:
Check jsconfig.json exists with:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue 2: API Calls Fail
```bash
Error: Failed to fetch

Solution:
1. Check backend is running on port 8000
2. Verify NEXT_PUBLIC_API_URL in .env.local
3. Check CORS settings in backend
```

### Issue 3: Images Not Loading
```bash
Error: Image failed to load

Solution:
1. Verify backend /image/{idx} endpoint works
2. Check image paths in backend
3. Try opening image URL directly in browser
```

### Issue 4: Theme Not Persisting
```bash
Issue: Theme resets on page refresh

Solution:
Check useTheme hook saves to localStorage:
localStorage.setItem('fashion-rag-theme', newTheme);
```

---

## 📊 Performance Testing

### Load Time Metrics
```bash
Expected Times:
- Initial page load: < 2s
- Search request: < 1s
- Image upload: < 2s
- Modal open: < 100ms
- Theme toggle: < 50ms
```

### Bundle Size Analysis
```bash
# Check bundle size
npm run build

# Expected sizes:
- Main bundle: < 200KB
- Component chunks: < 50KB each
```

---

## 🔬 Unit Test Examples

### Example 1: Test useSearch Hook
```javascript
import { renderHook, act } from '@testing-library/react';
import { useSearch } from '@/hooks/useSearch';

test('handleTextSearch updates results', async () => {
  const { result } = renderHook(() => useSearch());
  
  await act(async () => {
    await result.current.handleTextSearch('blue jeans', 5);
  });
  
  expect(result.current.results).toBeDefined();
  expect(result.current.loading).toBe(false);
});
```

### Example 2: Test ProductCard Component
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/Results/ProductCard';

test('ProductCard renders and handles click', () => {
  const mockItem = {
    idx: 1,
    display_name: 'Blue Jeans',
    category: 'Pants',
    score: 0.95
  };
  const mockOnClick = jest.fn();
  
  render(<ProductCard item={mockItem} onClick={mockOnClick} isDark={true} />);
  
  expect(screen.getByText('Blue Jeans')).toBeInTheDocument();
  
  fireEvent.click(screen.getByText('Blue Jeans'));
  expect(mockOnClick).toHaveBeenCalledWith(mockItem);
});
```

### Example 3: Test Toast Component
```javascript
import { render, screen } from '@testing-library/react';
import { Toast } from '@/components/UI/Toast';

test('Toast displays message and type correctly', () => {
  const toast = { message: 'Success!', type: 'success' };
  render(<Toast toast={toast} isDark={true} />);
  
  expect(screen.getByText('Success!')).toBeInTheDocument();
  expect(screen.getByText('✓')).toBeInTheDocument();
});
```

---

## 🚀 Integration Test Example

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';

describe('Search Flow Integration Test', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [
            { idx: 1, display_name: 'Test Product', score: 0.9 }
          ],
          rag_text: 'Test recommendation'
        })
      })
    );
  });

  test('Complete text search flow', async () => {
    render(<Home />);
    
    // 1. Enter text
    const input = screen.getByPlaceholderText(/tulis deskripsi/i);
    fireEvent.change(input, { target: { value: 'blue jeans' } });
    
    // 2. Click search
    const searchButton = screen.getByText(/search text/i);
    fireEvent.click(searchButton);
    
    // 3. Verify loading state
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
    
    // 4. Wait for results
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });
    
    // 5. Verify toast
    expect(screen.getByText(/found 1 results/i)).toBeInTheDocument();
    
    // 6. Click product
    fireEvent.click(screen.getByText(/test product/i));
    
    // 7. Verify modal
    expect(screen.getByText(/product detail/i)).toBeInTheDocument();
  });
});
```

---

## 📝 Test Coverage Goals

Aim for:
- **Hooks**: 90% coverage
- **Components**: 80% coverage
- **Utils/API**: 95% coverage
- **Overall**: 85% coverage

---

## 🎯 Acceptance Criteria

Before considering refactoring complete, verify:

- [ ] All 12 manual tests pass
- [ ] No console errors
- [ ] No console warnings (except dev warnings)
- [ ] All features work identically to original
- [ ] Performance is same or better
- [ ] Code is more readable and maintainable
- [ ] Documentation is complete
- [ ] Team members can understand structure

---

## 🔄 Continuous Testing

### Daily Checks
- Run `npm run dev` - no errors
- Test one full search flow
- Check one component functionality

### Weekly Checks
- Run all manual tests
- Check for new console warnings
- Review performance metrics

### Before Deployment
- Full manual test suite
- Run automated tests (when available)
- Check bundle size
- Test on multiple browsers
- Test on mobile devices

---

## 📞 Report Issues

If you find bugs during testing:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check network tab for failed requests
4. Document expected vs actual behavior
5. Take screenshots if helpful
6. Create issue with all details

---

**Happy Testing! 🎉**
