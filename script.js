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
    // If needed you could also keep per‑field auto‑fill status here.
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
  
  // Utility function to flash a field (green flash) – kept for non‑auto‑fill uses.
  function flashField(field) {
    field.classList.add('flash-green');
    setTimeout(() => {
      field.classList.remove('flash-green');
    }, 1000);
  }

  // Utility function to flash a field with our signature (purple flash)
  function flashSignature(field) {
    field.classList.add('flash-signature');
    setTimeout(() => {
      field.classList.remove('flash-signature');
    }, 1000);
  }

  // Updated updateFieldStatus: now accepts a third parameter (autoFill) so that
  // auto‑detected values flash in signature (purple) color.
  function updateFieldStatus(inputElement, value, autoFill = false) {
    inputElement.value = value;
    inputElement.classList.remove('field-success', 'field-fail', 'field-missing');
  
    // If the value is non‑empty and does not contain "unable to detect", consider it valid.
    if (value && value.trim().length > 0 && !value.toLowerCase().includes("unable to detect")) {
      inputElement.classList.add('field-success'); // Mark as success (green background)
      flashField(inputElement); // Flash green
      // After the flash animation, remove the success styling so the field returns to normal.
      setTimeout(() => {
        inputElement.classList.remove('field-success');
      }, 1000);
    } else {
      // If the value is empty or includes "unable to detect",
      // mark the field with error styling so that it remains highlighted for editing.
      inputElement.classList.add('field-fail');
    }
  }
  
  // Check required fields.
  function validateRequiredFields() {
    const requiredFields = [
      { element: nameInput, label: "Name" },
      { element: phoneInput, label: "Handynummer" },
      { element: emailInput, label: "E‑Mail" },
      { element: companyInput, label: "Unternehmen" },
      { element: positionInput, label: "Position" }
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
    // When user makes changes, clear any auto-fill styles.
    e.target.classList.remove('field-missing', 'field-success', 'field-fail');
  });
  
  phoneInput.addEventListener('input', (e) => {
    state.formData.phone = e.target.value;
    e.target.classList.remove('field-missing', 'field-success', 'field-fail');
  });
  
  emailInput.addEventListener('input', (e) => {
    state.formData.email = e.target.value;
    e.target.classList.remove('field-missing', 'field-success', 'field-fail');
  });
  
  companyInput.addEventListener('input', (e) => {
    state.formData.company = e.target.value;
    e.target.classList.remove('field-missing', 'field-success', 'field-fail');
  });
  
  positionInput.addEventListener('input', (e) => {
    state.formData.position = e.target.value;
    e.target.classList.remove('field-missing', 'field-success', 'field-fail');
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
  
  // When the user uploads an image:
  //  • Show the image immediately in the upload widget.
  //  • Keep the loading spinner visible.
  //  • Move the “Worüber waren wir im Gespräch?” text area (and tags) upward
  //    and change the label color to our signature color.
  cardUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Immediately show preview image in the upload widget.
      const previewURL = URL.createObjectURL(file);
      uploadContent.innerHTML = `<img class="preview-image" src="${previewURL}" alt="Business Card Preview">`;

      // Add "active" class so that the priority fields shift upward and their labels change color.
      if (priorityFields) {
        priorityFields.classList.add('active');
      }

      state.processing = true;
      updateUI();
      flashSignature(interestInput); // flash the textarea with our signature color

      const reader = new FileReader();
      reader.onload = (event) => {
        state.formData.uploadedImage = event.target.result;
        // Simulate API call and response
        fetch('https://run8n.xyz/webhook/businesCard', {
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
          // Assume data is an array with one object; if detection fails for a field, result will be empty or indicate failure.
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

    const { valid, missingElements } = validateRequiredFields();
    if (!valid) {
      missingElements[0].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

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