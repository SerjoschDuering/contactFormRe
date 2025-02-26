document.addEventListener('DOMContentLoaded', () => {
    // Global state object
    const state = {
      processing: false,
      submitted: false,
      formData: {
        uploadedImage: "",
        interest: "",
        name: "",
        familyName: "", // note: not provided by the API
        phone: "",
        email: "",
        company: "",
        position: "",
        tags: [],
        notes: ""
      }
    };
  
    // DOM Elements
    const cardUpload = document.getElementById('card-upload');
    const uploadWidget = document.getElementById('upload-widget');
    const uploadContent = document.getElementById('upload-content');
    const uploadOverlay = document.getElementById('upload-overlay');
    const businessForm = document.getElementById('business-form');
    const thankyouModal = document.getElementById('thankyou-modal');
    const closeModal = document.getElementById('close-modal');
    const interestInput = document.getElementById('interest');
    const nameInput = document.getElementById('name');
    const facilityInput = document.getElementById('familyName');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const companyInput = document.getElementById('company');
    const positionInput = document.getElementById('position');
    const notesInput = document.getElementById('notes');
    const tagElements = document.querySelectorAll('.tag');
    const priorityFields = document.getElementById('priority-fields');
    const priorityPrompt = document.getElementById('priority-prompt');
  
    // Utility function to flash a field.
    function flashField(field) {
      field.classList.add('flash-green');
      setTimeout(() => {
        field.classList.remove('flash-green');
      }, 1000);
    }
  
    // Function to update UI based on state.
    function updateUI() {
      if (state.processing) {
        uploadOverlay.classList.remove('hidden');
      } else {
        uploadOverlay.classList.add('hidden');
      }
  
      [nameInput, facilityInput, phoneInput, emailInput, companyInput, positionInput].forEach(input => {
        input.disabled = state.processing;
      });
  
      if (!state.processing && state.formData.uploadedImage !== "") {
        uploadWidget.classList.add('processed');
      } else {
        uploadWidget.classList.remove('processed');
      }
  
      if (state.submitted) {
        thankyouModal.classList.remove('hidden');
      } else {
        thankyouModal.classList.add('hidden');
      }
    }
  
    // Update state.formData on input changes.
    interestInput.addEventListener('input', (e) => state.formData.interest = e.target.value);
    nameInput.addEventListener('input', (e) => state.formData.name = e.target.value);
    facilityInput.addEventListener('input', (e) => state.formData.familyName = e.target.value);
    phoneInput.addEventListener('input', (e) => state.formData.phone = e.target.value);
    emailInput.addEventListener('input', (e) => state.formData.email = e.target.value);
    companyInput.addEventListener('input', (e) => state.formData.company = e.target.value);
    positionInput.addEventListener('input', (e) => state.formData.position = e.target.value);
    notesInput.addEventListener('input', (e) => state.formData.notes = e.target.value);
  
    // Handle tag selection.
    tagElements.forEach(tagEl => {
      tagEl.addEventListener('click', () => {
        const tag = tagEl.dataset.tag;
        if (tagEl.classList.contains('active')) {
          tagEl.classList.remove('active');
          state.formData.tags = state.formData.tags.filter(t => t !== tag);
        } else {
          tagEl.classList.add('active');
          state.formData.tags.push(tag);
        }
      });
    });
  
    // Handle image upload: call the API endpoint and update form fields.
    cardUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      console.log("File upload triggered.");
      
      if (file) {
        console.log("File detected:", file);
        const reader = new FileReader();
        reader.onload = (event) => {
          // Display image preview.
          uploadContent.innerHTML = `<img src="${event.target.result}" alt="Business Card Preview" class="preview-image">`;
          // Save base64-encoded image to state.
          state.formData.uploadedImage = event.target.result;
          
          // Update UI to show processing state.
          state.processing = true;
          updateUI();
  
          // Skip showing any priority message.
          if (priorityPrompt) {
            priorityPrompt.style.display = 'none';
          }
          // Move up the two form fields.
          if (priorityFields) {
            priorityFields.classList.add('active');
          }
          // Change the headline "What are you interested in?" to signature color.
          const interestLabel = document.querySelector("label[for='interest']");
          if (interestLabel) {
            interestLabel.style.color = "var(--primary-color)";
          }
          
          // Call API endpoint with the base64 image.
          fetch('https://run8n.xyz/webhook/businesCard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uploadedImage: state.formData.uploadedImage })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .then(data => {
            console.log("API response received:", data);
            // Now, expecting an array with one object.
            if (Array.isArray(data) && data.length > 0) {
              const result = data[0];
              // Combine first and family names.
              const fullName = result.name ? (result.familyName ? `${result.name} ${result.familyName}` : result.name) : "";
              state.formData.name = fullName;
              nameInput.value = fullName;
              flashField(nameInput);
              
              if (result.phone) {
                state.formData.phone = result.phone;
                phoneInput.value = result.phone;
                flashField(phoneInput);
              }
              if (result.email) {
                state.formData.email = result.email;
                emailInput.value = result.email;
                flashField(emailInput);
              }
              if (result.company) {
                state.formData.company = result.company;
                companyInput.value = result.company;
                flashField(companyInput);
              }
              if (result.position) {
                state.formData.position = result.position;
                positionInput.value = result.position;
                flashField(positionInput);
              }
              // Note: The API does not return a value for familyName.
            }
          })
          .catch(error => {
            console.error("Error processing business card:", error);
          })
          .finally(() => {
            state.processing = false;
            updateUI();
          });
        };
        reader.readAsDataURL(file);
      }
    });
  
    // Handle form submission, call the API endpoint, and redirect after 5 seconds.
    businessForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("Submitting form data:", JSON.stringify(state.formData, null, 2));
      
      try {
        const response = await fetch('https://run8n.xyz/webhook-test/businesCard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(state.formData)
        });
        if (!response.ok) {
          console.error("Error submitting form data:", response.statusText);
        } else {
          console.log("Form data submitted successfully.");
        }
      } catch (error) {
        console.error("Error submitting form data:", error);
      }
      
      state.submitted = true;
      updateUI();
      setTimeout(() => {
        window.location.href = "https://rehub.team";
      }, 5000);
    });
  
    // Handle closing the thank-you modal and resetting the form.
    closeModal.addEventListener('click', () => {
      state.submitted = false;
      businessForm.reset();
      uploadContent.innerHTML = '<span>📇 Upload Business Card</span>';
      cardUpload.value = "";
      state.formData = {
        uploadedImage: "",
        interest: "",
        name: "",
        familyName: "",
        phone: "",
        email: "",
        company: "",
        position: "",
        tags: [],
        notes: ""
      };
      tagElements.forEach(tagEl => tagEl.classList.remove('active'));
      if (priorityFields) {
        priorityFields.classList.remove('active');
      }
      updateUI();
    });
  
    updateUI();
  });