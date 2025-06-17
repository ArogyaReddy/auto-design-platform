/**
 * Scoring Alignment Initialization for Popup
 * 
 * This script initializes the scoring alignment fix when the popup loads.
 * It's separated from popup.html to comply with Content Security Policy.
 */

// Initialize scoring alignment when popup loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Checking scoring alignment components...');
    console.log('ScoringAlignmentFix available:', typeof window.ScoringAlignmentFix !== 'undefined');
    console.log('ScoringIntegration class available:', typeof window.ScoringIntegration !== 'undefined');
    console.log('scoringIntegration instance available:', typeof window.scoringIntegration !== 'undefined');
    
    // Create instance if it doesn't exist but classes are available
    if (window.ScoringAlignmentFix && window.ScoringIntegration && !window.scoringIntegration) {
        try {
            console.log('🔄 Creating scoring integration instance...');
            window.scoringIntegration = new window.ScoringIntegration();
            console.log('✅ Scoring integration instance created successfully');
        } catch (error) {
            console.error('❌ Failed to create scoring integration instance:', error);
            return;
        }
    }
    
    if (window.ScoringAlignmentFix && window.scoringIntegration) {
        console.log('🎯 Scoring alignment fix loaded and ready');
        
        // Add alignment info to UI
        const footer = document.querySelector('.footer');
        if (footer) {
            const alignmentInfo = document.createElement('div');
            alignmentInfo.style.cssText = `
                font-size: 10px;
                color: #9ca3af;
                text-align: center;
                margin-top: 5px;
                padding: 2px;
                border-top: 1px solid #e5e7eb;
            `;
            alignmentInfo.innerHTML = '🎯 Scoring alignment enabled';
            footer.appendChild(alignmentInfo);
        }
        
        // Initialize scoring integration
        if (window.scoringIntegration && typeof window.scoringIntegration.integrateWithElementExtractor === 'function') {
            try {
                window.scoringIntegration.integrateWithElementExtractor();
                console.log('🎯 Scoring integration activated');
            } catch (error) {
                console.warn('⚠️ Scoring integration failed:', error.message);
            }
        }
    } else {
        console.warn('⚠️ Scoring alignment components not loaded');
        console.log('Available window properties:', Object.keys(window).filter(key => key.includes('scoring') || key.includes('Scoring')));
    }
});

// Add global helper functions for console debugging
window.testScoringAlignment = () => {
    if (window.scoringIntegration && window.scoringIntegration.demonstrateAlignment) {
        return window.scoringIntegration.demonstrateAlignment();
    } else if (window.ScoringIntegration && window.ScoringAlignmentFix) {
        console.log('🔄 Creating temporary instance for testing...');
        try {
            const tempIntegration = new window.ScoringIntegration();
            return tempIntegration.demonstrateAlignment();
        } catch (error) {
            console.warn('⚠️ Failed to create temporary instance:', error.message);
            return null;
        }
    } else {
        console.warn('⚠️ Scoring integration not available');
        return null;
    }
};

window.getScoringReport = () => {
    if (window.scoringIntegration && window.scoringIntegration.generateSessionReport) {
        return window.scoringIntegration.generateSessionReport();
    } else if (window.ScoringIntegration && window.ScoringAlignmentFix) {
        console.log('🔄 Creating temporary instance for reporting...');
        try {
            const tempIntegration = new window.ScoringIntegration();
            return tempIntegration.generateSessionReport();
        } catch (error) {
            console.warn('⚠️ Failed to create temporary instance:', error.message);
            return null;
        }
    } else {
        console.warn('⚠️ Scoring integration not available');
        return null;
    }
};

window.createScoringInstance = () => {
    if (window.ScoringIntegration && window.ScoringAlignmentFix) {
        try {
            window.scoringIntegration = new window.ScoringIntegration();
            console.log('✅ Scoring integration instance created manually');
            return true;
        } catch (error) {
            console.error('❌ Failed to create instance:', error.message);
            return false;
        }
    } else {
        console.warn('⚠️ Required classes not available');
        return false;
    }
};

console.log('✅ Scoring alignment initialization script loaded');
console.log('🔧 Available debug functions: testScoringAlignment(), getScoringReport(), createScoringInstance()');
