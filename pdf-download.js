// ============================================
// PDF DOWNLOAD - With Crack Marks on Image
// ============================================

function loadLibraries() {
    return new Promise((resolve) => {
        if (window.html2canvas && window.jspdf) {
            resolve();
            return;
        }

        let loaded = 0;
        const checkLoaded = () => {
            loaded++;
            if (loaded === 2) resolve();
        };

        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script1.onload = checkLoaded;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script2.onload = checkLoaded;
        document.head.appendChild(script2);

        setTimeout(resolve, 5000);
    });
}

async function generatePDF() {
    const btn = event ? event.target : document.querySelector('.btn-download');
    const originalText = btn ? btn.innerHTML : 'Download PDF';
    
    if (btn) {
        btn.innerHTML = '⏳ Generating PDF...';
        btn.disabled = true;
    }

    try {
        await loadLibraries();
        await new Promise(r => setTimeout(r, 500));

        let content = document.querySelector('#printArea') || 
                     document.querySelector('.report-preview') || 
                     document.querySelector('.report-content') ||
                     document.querySelector('.report-container') ||
                     document.querySelector('main') ||
                     document.body;

        // Make sure canvas marks are visible
        const canvas = document.getElementById('markCanvas');
        if (canvas) {
            canvas.style.display = 'block';
            canvas.style.pointerEvents = 'none';
        }

        // Capture with higher quality
        const capturedCanvas = await html2canvas(content, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 800,
            height: content.scrollHeight,
            onclone: function(clonedDoc, element) {
                const clonedCanvas = clonedDoc.getElementById('markCanvas');
                if (clonedCanvas) {
                    clonedCanvas.style.display = 'block';
                    clonedCanvas.style.pointerEvents = 'none';
                }
            }
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = capturedCanvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (capturedCanvas.height * pdfWidth) / capturedCanvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        pdf.save(`AI_Heritage_Report_${dateStr}.pdf`);

        if (btn) {
            btn.innerHTML = '✅ Downloaded!';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 2000);
        }

    } catch (error) {
        console.error('PDF Error:', error);
        alert('❌ PDF generation failed. Using browser print instead.');
        window.print();
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// ---------- AUTO ADD DOWNLOAD BUTTON ----------
document.addEventListener('DOMContentLoaded', function() {
    const hasReport = document.querySelector('.report-preview') || 
                     document.querySelector('#printArea') ||
                     document.querySelector('.report-content') ||
                     document.querySelector('.report-container');
    
    if (hasReport) {
        const existingBtn = document.querySelector('.btn-download');
        if (!existingBtn) {
            const container = document.querySelector('.report-download') || 
                            document.querySelector('.container') ||
                            document.querySelector('main');
            
            if (container) {
                const btnDiv = document.createElement('div');
                btnDiv.style.cssText = 'text-align:center; padding:2rem;';
                btnDiv.innerHTML = `
                    <button onclick="generatePDF()" class="btn-download" style="padding:1rem 3rem; background:linear-gradient(135deg, #1a2e3f, #2c4a5f); color:#fff; border:none; border-radius:50px; font-weight:600; cursor:pointer; font-size:1.1rem; font-family:'Inter',sans-serif; box-shadow: 0 4px 15px rgba(26,46,63,0.3); transition:all 0.3s ease;"
                            onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(26,46,63,0.4)';"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(26,46,63,0.3)';">
                        <i class="fas fa-file-pdf"></i> Download Full Report with Marks
                    </button>
                `;
                container.appendChild(btnDiv);
            }
        }
    }
});

console.log('✅ PDF Download with Crack Marks ready!');