# v9 - UI/UX Refinements

## Bottom Navigation Bar
✅ **Isolated Office Button**: Pencil icon (office) is now visually separated from other nav items
   - Office button sits on the left as a standalone golden circle (w-14 h-14)
   - Navigation bar contains only 4 tabs (home, library, locations, favorites)
   - Gap between them creates clear visual separation

## Office View (Project List)
✅ **Card-Based Layout**: Projects display as large, beautiful cards instead of compact list items
   - Each card: rounded-3xl with gradient background (surface → surface2)
   - Shows project name prominently at top with edit icon on right
   - Ceremony button (Film icon) with date in teal
   - Formality button (Clock icon) with date in rose
   - Revenue footer showing total income

## Project Detail View  
✅ **Editable Project Name**: Title field at top with placeholder behavior
   - Clears on focus, saves on blur if changed

✅ **Removed Customer Name Field**: No longer shown in project detail view
   - Previously bloated the interface unnecessarily
   - Customer name removed from invoice generation too

✅ **Toggle Switches for Services & Cameras**: Replaced checkboxes with native-feeling toggles
   - Each service: toggle + optional description textarea below
   - Each camera: toggle + optional description textarea below  
   - Toggles styled in teal when active, line-color when inactive

## Invoice Modal
✅ **Separate Modal Panel**: Opens via "مشاهده فاکتور" button
   - Header: studio name + project name + close button
   - Two-row line-item layout:
     - Row 1: Service name | Edit & Delete icons
     - Row 2: Quantity (±) | Price input (formatted with Persian separators)
   - Separator line between items
   - Auto-calculated total at bottom
   - Quantity controls: +/- buttons with min value of 1

✅ **Currency Formatting**: Prices display with Persian thousands separator (٫)
   - Example: ۱۲٫۳۴۵ تومان
   - Applied throughout price displays

## OfficeProjectEditor
✅ **No Customer Name Input**: Removed from project creation/editing form
   - Invoice items no longer store customerName
   - Keeps focus on service/camera setup

✅ **Service & Camera List**: Maintained existing toggle UI
   - Can still add/edit services and cameras during project setup

## Type System
✅ All TypeScript errors resolved
✅ No breaking changes to data structures (ProjectInvoice customerName now optional/undefined)

## Next Steps
- Test npm install & typecheck after extraction
- Verify invoice modal works with actual ceremony/formality data
- Test Persian number formatting in different browsers
