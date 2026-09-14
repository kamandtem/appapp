# v14 - Standalone Invoices System & UI Fixes

## ProjectDetailView - Invoice Removal
✅ **Removed from Project Detail**:
   - Deleted "مشاهده فاکتور" button
   - Removed InvoiceModal component
   - Removed showInvoiceModal state
   - Project detail now shows only ceremony/formality info + edit/delete buttons

## OfficeView - Major Restructuring
✅ **Two-Tab Interface**:
   - Tab 1: "پروژه‌ها" (Projects) - existing project list
   - Tab 2: "فاکتورها" (Invoices) - new invoice management
   - Tabs styled with gold highlight for active tab
   - Smooth switching between views

✅ **Projects Tab** (unchanged from before):
   - Card-based layout for projects
   - Shows ceremony/formality dates
   - Display total revenue
   - Edit and create project buttons

## InvoicesPanel Component - NEW
✅ **Standalone Invoice System**:
   - Completely independent from projects
   - Uses localStorage for persistence
   - Can create unlimited invoices

✅ **Invoice Creation Form**:
   - Title input: "عنوان" (Invoice title)
   - Customer name: "نام مشتری"
   - Date picker: "تاریخ"
   - Items section with ability to add multiple line items

✅ **Line Items Management**:
   - Item name (نام خدمت)
   - Quantity (تعداد) - minimum 1
   - Price per item (مبلغ) - with Persian number formatting
   - Delete button for each item
   - "Add Item" button to add more lines

✅ **Invoice Totals**:
   - Automatic calculation: sum of (quantity × price) for all items
   - Displays total in gold
   - Shows "جمع کل" label

✅ **Invoice List**:
   - Shows all saved invoices
   - Displays title, customer name, date
   - Shows total amount for each invoice
   - Delete button to remove invoices
   - Empty state when no invoices

✅ **Data Persistence**:
   - All invoices saved in localStorage under 'invoices' key
   - Survives page refresh
   - JSON format: Array<InvoiceRecord>

## ProjectDetailView - Services Toggle Fix
✅ **Services Display Direction**:
   - Changed from: `justify-between` with label on left, toggle on right
   - Changed to: `justify-start` with toggle on left, label on right
   - Toggle now appears FIRST (right side in RTL)
   - Label appears SECOND (left side in RTL)
   - More intuitive for RTL layout
   - Classes changed: `flex items-center justify-start gap-3`

## Type System Updates
✅ **New InvoiceRecord Interface**:
```typescript
export interface InvoiceRecord {
  id: string;
  title: string;
  customerName: string;
  date: string;           // ISO date format
  items: Array<{ name: string; count: number; price: number }>;
  total: number;          // Auto-calculated
  createdAt: number;      // Timestamp
  updatedAt: number;      // Timestamp
}
```

## Testing Checklist
- ✓ Can switch between Projects and Invoices tabs
- ✓ Can create invoice with title, customer, date
- ✓ Can add multiple items to invoice
- ✓ Can delete items
- ✓ Total calculates automatically
- ✓ Invoices save to localStorage
- ✓ Can view saved invoices list
- ✓ Can delete saved invoices
- ✓ Services toggle is on correct side (right/first)
- ✓ Number formatting shows Persian separators

## Architecture Notes
- Invoices are completely separate from Projects
- No relationship between them
- Each system manages its own data
- Both use localStorage for persistence
- Clean component separation (InvoicesPanel is reusable)

## Next Steps
- Add edit functionality for existing invoices
- Add export/print invoice functionality
- Add invoice templates
- Add search/filter for invoices
