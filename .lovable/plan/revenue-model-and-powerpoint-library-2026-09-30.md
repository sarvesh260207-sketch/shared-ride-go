# Revenue model and PowerPoint library

## What will be added
- Add a full-width section at the very bottom of the home page with two clear actions.
- Add a glowing light-green **Revenue Model** action that opens the uploaded revenue-model image in a large, readable viewer.
- Add a **PowerPoint** action beside it where a signed-in user can upload, replace, open, download, or remove one `.ppt`/`.pptx` file.
- Keep the presentation private to the person who uploaded it; other visitors cannot overwrite or access it.

## Offline behavior
- Make the published app installable and cache its main screens plus the revenue-model image for offline viewing.
- Save the uploaded PowerPoint on the user’s device after upload/open so their current file remains downloadable offline on that device.
- Show a clear offline state when a cloud action cannot run. Offline support applies to the published app, not the editor preview.

## Technical details
- Store the supplied image as a project media asset.
- Add a private cloud storage bucket with owner-only access rules and enforce one presentation path per user.
- Use IndexedDB for the local PowerPoint copy because presentations can exceed normal browser key-value limits.
- Add guarded PWA registration with network-first page navigation, cached built assets, and no registration in Lovable previews.
- Add accessible dialogs, file type/size validation, progress/error messages, and responsive bottom actions.
- Verify upload/replace/download/remove behavior, offline fallback, desktop layout, and mobile layout.
