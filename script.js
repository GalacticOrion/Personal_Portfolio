    document.getElementById('year').textContent = new Date().getFullYear();

    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const root = document.documentElement;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      root.classList.add('light-mode');
    }
    
    themeToggle.addEventListener('click', () => {
      root.classList.toggle('light-mode');
      // Save theme preference
      if (root.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
      } else {
        localStorage.setItem('theme', 'dark');
      }
    });

    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Function to animate timeline items
    function animateTimelineItems(tabId) {
      if (tabId === 'education' || tabId === 'experience') {
        const timelineItems = document.querySelectorAll(`#${tabId} .timeline-item`);
        timelineItems.forEach((item, index) => {
          item.style.animationDelay = `${index * 0.2}s`;
        });
      }
      
      // Trigger progress bar animation for languages tab
      if (tabId === 'languages') {
        const progressBars = document.querySelectorAll('.language-progress');
        progressBars.forEach((bar, index) => {
          bar.style.animationDelay = `${index * 0.2}s`;
        });
      }
    }
    
    // Animate the initially active tab
    const initialActiveTab = document.querySelector('.tab-pane.active').id;
    animateTimelineItems(initialActiveTab);
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get target tab and activate it
        const targetTab = button.getAttribute('data-tab');
        document.getElementById(targetTab).classList.add('active');
        
        // Animate the content of the active tab
        animateTimelineItems(targetTab);
      });
    });

    // Section observer for animations and nav highlighting
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Get the corresponding nav link
          const id = entry.target.getAttribute('id');
          const navLink = document.querySelector(`nav a[href="#${id}"]`);
          
          // Update active nav item
          navLinks.forEach(link => link.classList.remove('active'));
          if (navLink) navLink.classList.add('active');
        }
      });
    }, { threshold: 0.3 });
    
    sections.forEach(section => observer.observe(section));

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a, .scroll-down').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth'
          });
          
          // Update active nav item if it's a nav link
          if (this.parentElement.tagName === 'NAV') {
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
          }
        }
      });
    });

    // Form submit handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const name = formData.get('name');
        
        // In a real application, you would send this data to a server
        alert(`Thanks for your message, ${name}! This is a demo form - in a real application, your message would be sent to the server.`);
        this.reset();
      });
    }
