document.addEventListener('DOMContentLoaded', () => {
    const jobsContainer = document.getElementById('jobs-container');
    const filterCity = document.getElementById('filter-city');
    const filterSector = document.getElementById('filter-sector');
    
    let allJobs = [];

    // Fetch jobs
    fetch('data/jobs.json')
        .then(response => response.json())
        .then(data => {
            allJobs = data;
            renderJobs(allJobs);
        })
        .catch(error => {
            console.error('Error fetching jobs:', error);
            if(jobsContainer) {
                jobsContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Failed to load jobs. Please try again later.</p>';
            }
        });

    function renderJobs(jobs) {
        if (!jobsContainer) return;
        
        jobsContainer.innerHTML = '';
        
        if (jobs.length === 0) {
            jobsContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 2rem;">No jobs found matching your criteria.</p>';
            return;
        }

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'card fade-in appear';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '1rem';
            
            card.innerHTML = `
                <div>
                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${job.title}</h3>
                    <p style="color: var(--text-light); font-weight: 500;">${job.company}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
                    <p><i class="fas fa-map-marker-alt" style="color: var(--accent-color); width: 20px;"></i> ${job.city}</p>
                    <p><i class="fas fa-yen-sign" style="color: var(--accent-color); width: 20px;"></i> ${parseInt(job.salary).toLocaleString()}/month</p>
                    <p><i class="fas fa-language" style="color: var(--accent-color); width: 20px;"></i> JLPT: ${job.language}</p>
                    <p><i class="fas fa-home" style="color: var(--accent-color); width: 20px;"></i> Housing: ${job.housing ? 'Yes' : 'No'}</p>
                </div>
                <button class="btn btn-primary" style="margin-top: auto;" onclick="openApplyModal('${job.title}', '${job.company}')">Apply Now</button>
            `;
            jobsContainer.appendChild(card);
        });
    }

    function filterJobs() {
        const city = filterCity ? filterCity.value : '';
        const sector = filterSector ? filterSector.value : '';

        const filtered = allJobs.filter(job => {
            const matchCity = city === '' || job.city === city;
            const matchSector = sector === '' || job.sector === sector;
            return matchCity && matchSector;
        });

        renderJobs(filtered);
    }

    if (filterCity) filterCity.addEventListener('change', filterJobs);
    if (filterSector) filterSector.addEventListener('change', filterJobs);

    // Modal Logic
    const modal = document.getElementById('apply-modal');
    const closeBtn = document.querySelector('.close-modal');
    const applyForm = document.getElementById('apply-form');
    const jobTitleInput = document.getElementById('apply-job-title');

    window.openApplyModal = function(title, company) {
        if(jobTitleInput) jobTitleInput.value = `${title} at ${company}`;
        if(modal) modal.style.display = 'flex';
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if(modal) modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = applyForm.querySelector('button[type="submit"]');
            btn.innerText = 'Application Sent! ✓';
            btn.style.backgroundColor = '#25D366';
            
            setTimeout(() => {
                modal.style.display = 'none';
                btn.innerText = 'Submit Application';
                btn.style.backgroundColor = '';
                applyForm.reset();
            }, 2000);
        });
    }
});
