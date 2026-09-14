# v10 - Menu & Pose Display Enhancements

## AddPoseSheet - Lens Selection
✅ **Lens Type Selector**: Replaced text input with chip-select dropdown
   - Options: واید (24-35mm), معمولی (50mm), تله (70-85mm)
   - Added separate field for additional camera settings (f-stop, ISO, shutter)

## Project Day (Favorites > Projects) - Pose Display
✅ **2-Column Grid Layout**: Changed from list to card-based 2-column grid
   - Each card shows pose image (full square)
   - Below: pose name + action buttons (complete checkmark + delete trash icon)
   - Icons moved to bottom-left of each card
   - Better visual scanning for selecting poses during shooting

## Side Menu - Complete Reorganization
✅ **Menu Item Order** (top to bottom):
   1. دفتر آتلیه (Office)
   2. خانه (Home)
   3. کتابخانه ژست‌ها (Pose Library)
   4. اصول ژست‌دهی (Pose Principles)
   5. ژست‌های من (My Poses)
   6. لوکیشن‌های من (My Locations)
   7. چک‌لیست وسایل (Gear Checklist)
   
✅ **Profile Section Redesign**:
   - Removed old small profile image, replaced with large button (h-32 w-full)
   - Shows user's profile image with "لمس برای تغییر تصویر" hint
   - Below: welcome message + user's name (profile?.name)
   - Removed generic "پروفایل کاربر" label, now shows actual name

✅ **Action Buttons Under Profile**:
   - پروفایل button (UserRound icon) - opens profile editor
   - Settings button (gear icon) - navigates to settings
   - Theme button (Sun/Moon icon) - toggles dark/light mode
   - All three in a horizontal row below profile image

✅ **Removed Items**:
   - "پروفایل کاربر" now shows user's actual name
   - "افزودن ژست جدید" removed from menu (accessible via + button in library view)
   - "لوکیشن‌ها" (generic locations) removed
   - "آب‌وهوا و نور" removed
   - "علاقه‌مندی‌ها" removed
   - Duplicate "تنظیمات" removed (now available via gear icon in header)

✅ **Credits Updated**:
   - Changed from "نسخه ۱.۰ · کاملاً آفلاین"
   - To: "برنامه‌نویس: محمدرضا ارجمند"
   - Located at bottom of menu panel

## Next Steps
- Test profile image upload/display functionality
- Verify 2-column pose grid on different screen sizes
- Test menu navigation and new menu order
- Confirm all TypeScript types still match with removed menu items
