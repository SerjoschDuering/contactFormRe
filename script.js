document.addEventListener('DOMContentLoaded', () => {
  // Global state object
  const state = {
    processing: false,
    submitted: false,
    formData: {
      uploadedImage: "",
      interest: "",
      name: "",
      phone: "",
      email: "",
      company: "",
      position: "",
      tags: [],
      contacted: ""
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
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const companyInput = document.getElementById('company');
  const positionInput = document.getElementById('position');
  const contactedSelect = document.getElementById('contacted');
  const tagElements = document.querySelectorAll('.tag');
  const priorityFields = document.getElementById('priority-fields');
  const priorityPrompt = document.getElementById('priority-prompt');

  // Utility function to flash a field (green flash)
  function flashField(field) {
    field.classList.add('flash-green');
    setTimeout(() => {
      field.classList.remove('flash-green');
    }, 1000);
  }

  // New utility function to flash the text area in signature color
  function flashSignature(field) {
    field.classList.add('flash-signature');
    setTimeout(() => {
      field.classList.remove('flash-signature');
    }, 1000);
  }

  // Utility function to update field status based on auto-fill result
  function updateFieldStatus(inputElement, value) {
    inputElement.value = value;
    inputElement.classList.remove('field-success', 'field-fail');
    if (value && value.trim().length > 0) {
      inputElement.classList.add('field-success');
    } else {
      inputElement.classList.add('field-fail');
    }
  }

  // Function to update UI based on state.
  function updateUI() {
    if (state.processing) {
      uploadOverlay.classList.remove('hidden');
    } else {
      uploadOverlay.classList.add('hidden');
    }

    [nameInput, phoneInput, emailInput, companyInput, positionInput].forEach(input => {
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
  phoneInput.addEventListener('input', (e) => state.formData.phone = e.target.value);
  emailInput.addEventListener('input', (e) => state.formData.email = e.target.value);
  companyInput.addEventListener('input', (e) => state.formData.company = e.target.value);
  positionInput.addEventListener('input', (e) => state.formData.position = e.target.value);
  if (contactedSelect) {
    contactedSelect.addEventListener('change', (e) => state.formData.contacted = e.target.value);
  }

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

  // Handle image upload: process image and call API for auto-fill.
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

        // Hide the priority prompt and activate the priority fields.
        if (priorityPrompt) {
          priorityPrompt.style.display = 'none';
        }
        if (priorityFields) {
          priorityFields.classList.add('active');
        }
        // Change the headline color of the interest field.
        const interestLabel = document.querySelector("label[for='interest']");
        if (interestLabel) {
          interestLabel.style.color = "var(--primary-color)";
        }
        // Flash the text area in signature color to encourage filling.
        flashSignature(interestInput);
        
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
          // Expecting an array with one object.
          if (Array.isArray(data) && data.length > 0) {
            const result = data[0];
            updateFieldStatus(nameInput, result.name || "");
            state.formData.name = result.name || "";
            updateFieldStatus(phoneInput, result.phone || "");
            state.formData.phone = result.phone || "";
            updateFieldStatus(emailInput, result.email || "");
            state.formData.email = result.email || "";
            updateFieldStatus(companyInput, result.company || "");
            state.formData.company = result.company || "";
            updateFieldStatus(positionInput, result.position || "");
            state.formData.position = result.position || "";
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

  // Handle form submission: open modal immediately and redirect on API response.
  businessForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Open modal immediately.
    state.submitted = true;
    updateUI();

    try {
      const response = await fetch('https://run8n.xyz/webhook/storeBusinesCard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.formData)
      });
      if (!response.ok) {
        console.error("Error during final submission:", response.statusText);
      } else {
        console.log("Final form submission succeeded.");
      }
    } catch (error) {
      console.error("Error during final form submission:", error);
    }
    
    // Redirect immediately after the API call finishes.
    window.location.href = "https://rehub.team";
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
      phone: "",
      email: "",
      company: "",
      position: "",
      tags: [],
      contacted: ""
    };
    tagElements.forEach(tagEl => tagEl.classList.remove('active'));
    if (priorityFields) {
      priorityFields.classList.remove('active');
    }
    // Reset the contacted select field to its default.
    if (contactedSelect) {
      contactedSelect.selectedIndex = 0;
    }
    updateUI();
  });

  updateUI();
});