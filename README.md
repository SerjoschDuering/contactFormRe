This is a simple website to submit a contact for with the addition of an optional image upload for business cars the image will be processed externally by ai (takes 15 seconds). While waiting for the resutls (auto filling of form) the user can start filling out the free text section. Ther should be loading/blocking animatio indicator after the image was uploaded for all fields exepct the free text  and topic/ selector. 
After the AI generated data returned, the form fields are filled as good as possible, nowt he suer can contiue filling them out or adjsuting if all required fields are full they can hit submit. 

It should be mobile friend/ first for cellphones but flexible sclaing 

Initial Screen (Header & Upload)
Header: Displays a title (e.g., “Business Card Submission”) along with a logo placeholder.
Image Upload: A large, mobile‐friendly button (with a business card icon) lets the user upload/take a picture of their business card. Once the image is captured, a preview thumbnail is shown.
Processing Indicator: When an image is uploaded, the app immediately sends the image to an n8n workflow for parsing. A floating spinner (or similar indicator) appears to inform the user that the image is being processed.
Manual Input Section
Separator: A horizontal separator with “--OR--” clearly shows that users can enter data manually.
Form Fields: Easy-to-read inputs for Name, Facility Name, Phone, eMail, Company, and Position.
Additional Inputs: Selectable tags (to categorize or add keywords) and a free text area for any extra notes.
Interest Section: While the image is being processed, a section (placed at the top of the manual area) prompts users to quickly fill out what they were interested in or the discussion topic.
Data Update & Submission
Auto-Fill Update: When the n8n endpoint returns the parsed data, the form’s JSON is updated—auto-filling any matching fields so that the user can review and make adjustments.
Final Submission: On tapping the large “Submit” button, the entire JSON object (which now contains both the auto-filled and manually entered data) is sent to another n8n workflow.
Feedback Modal: After submission, the user sees a modal with a green checkmark and a thank-you message.