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
  const submitButton = document.querySelector('.submit-button');
  
  // Utility function to flash a field (green flash)
  function flashField(field) {
    field.classList.add('flash-green');
    setTimeout(() => {
      field.classList.remove('flash-green');
    }, 1000);
  }

  // Utility function to flash the text area in signature color
  function flashSignature(field) {
    field.classList.add('flash-signature');
    setTimeout(() => {
      field.classList.remove('flash-signature');
    }, 1000);
  }

  // Updated updateFieldStatus utility function:
  // Sets the input value, adds success/fail class, flashes the field, then re-checks required fields.
  function updateFieldStatus(inputElement, value) {
    inputElement.value = value;
    inputElement.classList.remove('field-success', 'field-fail', 'field-missing');
    if (value && value.trim().length > 0) {
      inputElement.classList.add('field-success');  // Valid auto-fill value
    } else {
      inputElement.classList.add('field-fail');  // Detection failed – user must enter value manually
    }
    flashField(inputElement);
  }
  
  // Check required fields.
  // For each required field, if its value is missing or if it has an auto-detect failure,
  // mark it with .field-missing and collect those elements.
  function validateRequiredFields() {
    const requiredFields = [
      { element: nameInput, label: "Name" },
      { element: companyInput, label: "Unternehmen" },
      { element: phoneInput, label: "Handynummer" },
      { element: emailInput, label: "E‑Mail" }
    ];
    let valid = true;
    const missingElements = [];
    requiredFields.forEach(field => {
      if (!field.element.value || field.element.classList.contains('field-fail')) {
        field.element.classList.add('field-missing');
        valid = false;
        missingElements.push(field.element);
      } else {
        field.element.classList.remove('field-missing');
      }
    });
    return { valid, missingElements };
  }
  
  // Update state.formData on input changes.
  interestInput.addEventListener('input', (e) => {
    state.formData.interest = e.target.value;
  });
  nameInput.addEventListener('input', (e) => {
    state.formData.name = e.target.value;
    // Remove error marking once the user types.
    if (e.target.value.trim().length > 0) {
      e.target.classList.remove('field-missing');
    }
  });
  phoneInput.addEventListener('input', (e) => {
    state.formData.phone = e.target.value;
    if (e.target.value.trim().length > 0) {
      e.target.classList.remove('field-missing');
    }
  });
  emailInput.addEventListener('input', (e) => {
    state.formData.email = e.target.value;
    if (e.target.value.trim().length > 0) {
      e.target.classList.remove('field-missing');
    }
  });
  companyInput.addEventListener('input', (e) => {
    state.formData.company = e.target.value;
    if (e.target.value.trim().length > 0) {
      e.target.classList.remove('field-missing');
    }
  });
  positionInput.addEventListener('input', (e) => {
    state.formData.position = e.target.value;
  });
  if (contactedSelect) {
    contactedSelect.addEventListener('change', (e) => {
      state.formData.contacted = e.target.value;
    });
  }
  
  // Handle tag selection.
  tagElements.forEach(tagEl => {
    tagEl.addEventListener('click', () => {
      tagEl.classList.toggle('active');
      state.formData.tags = Array.from(tagElements)
                                  .filter(el => el.classList.contains('active'))
                                  .map(el => el.getAttribute('data-tag'));
    });
  });

  // Simulated auto-fill from API call upon image upload.
  cardUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      state.processing = true;
      updateUI();
      flashSignature(interestInput); // also flash the textarea
      const reader = new FileReader();
      reader.onload = (event) => {
        state.formData.uploadedImage = event.target.result;
        // Simulate API call and response
        fetch('https://run8n.xyz/webhook/storeBusinesCard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadedImage: state.formData.uploadedImage })
        })
        .then(response => {
          if (!response.ok) { throw new Error(response.statusText); }
          return response.json();
        })
        .then(data => {
          console.log("API response received:", data);
          // Assume data is an array with one object where detection may succeed or fail.
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

  // UI update function
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

  // Handle form submission.
  businessForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check required fields. If any are missing/invalid, mark them and scroll to the first.
    const { valid, missingElements } = validateRequiredFields();
    if (!valid) {
      missingElements[0].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Open modal immediately and proceed with submission.
    state.submitted = true;
    updateUI();

    try {
      const response = await fetch('https://run8n.xyz/webhook/storeBusinesCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  if (closeModal) {
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
      if (contactedSelect) {
        contactedSelect.selectedIndex = 0;
      }
      updateUI();
    });
  }

  updateUI();
});