/**
 * Integration Script for Scoring Alignment Fix
 * 
 * This script integrates the scoring alignment fix into both Element Extractor
 * and Playwright validation workflows to ensure consistent scoring.
 */

// Import ScoringAlignmentFix if in Node.js environment
let ScoringAlignmentFix;
if (typeof module !== 'undefined' && module.exports) {
    ScoringAlignmentFix = require('./scoring-alignment-fix');
} else if (typeof window !== 'undefined') {
    // In browser, ScoringAlignmentFix should be available globally
    ScoringAlignmentFix = window.ScoringAlignmentFix;
}

// Check if ScoringIntegration is already defined to prevent redeclaration
if (typeof window !== 'undefined' && window.ScoringIntegration) {
    console.log('🎯 ScoringIntegration already loaded, skipping redeclaration');
} else {

class ScoringIntegration {
    constructor() {
        // Ensure ScoringAlignmentFix is available
        if (!ScoringAlignmentFix) {
            throw new Error('ScoringAlignmentFix not available. Ensure scoring-alignment-fix.js is loaded first.');
        }
        
        this.alignmentFix = new ScoringAlignmentFix();
        this.aligned_results = new Map();
        this.statistics = {
            total_alignments: 0,
            significant_improvements: 0,
            consistency_rate: 0
        };
        
        console.log('✅ ScoringIntegration initialized successfully');
    }

    /**
     * Apply scoring alignment to Element Extractor popup integration
     */
    integrateWithElementExtractor() {
        // Hook into the Playwright validation in popup.js
        if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
            this.integrateWithPopup();
        }
    }

    /**
     * Integrate with popup.js Playwright validation
     */
    integrateWithPopup() {
        // Override the existing Playwright validation function
        const originalValidation = window.validateWithPlaywright;
        
        if (originalValidation) {
            window.validateWithPlaywright = async (locator, elementData, options = {}) => {
                try {
                    // Get original results from both systems
                    const playwrightResult = await originalValidation(locator, elementData, options);
                    
                    const elementExtractorResult = {
                        locator: elementData.locator || locator,
                        type: elementData.locatorType || elementData.type,
                        strength: elementData.strength || elementData.originalStrength || 0
                    };

                    // Apply alignment
                    const alignment = this.alignmentFix.alignScoring(elementExtractorResult, playwrightResult);
                    
                    // Create unified result
                    const unifiedResult = {
                        ...playwrightResult,
                        overall: {
                            ...playwrightResult.overall,
                            score: alignment.alignedScore,
                            grade: alignment.alignedGrade,
                            aligned: true,
                            alignment_info: alignment
                        }
                    };

                    // Store for analysis
                    this.aligned_results.set(locator, alignment);
                    this.updateStatistics(alignment);

                    console.log('🎯 Scoring Aligned:', {
                        locator: locator.substring(0, 50) + '...',
                        element_extractor: alignment.originalEEScore,
                        playwright: alignment.originalPWScore,
                        aligned: alignment.alignedScore,
                        strategy: alignment.strategy
                    });

                    return unifiedResult;

                } catch (error) {
                    console.error('❌ Scoring alignment failed:', error);
                    return originalValidation(locator, elementData, options);
                }
            };
        }

        // Also integrate with batch validation
        this.integrateBatchValidation();
    }

    /**
     * Integrate with batch validation functions
     */
    integrateBatchValidation() {
        const originalBatchValidation = window.batchValidateWithPlaywright;
        
        if (originalBatchValidation) {
            window.batchValidateWithPlaywright = async (elements, options = {}) => {
                const results = await originalBatchValidation(elements, options);
                
                // Apply alignment to all results
                const alignedResults = results.map(result => {
                    if (result.elementData && result.validation) {
                        const eeResult = {
                            locator: result.validation.locator,
                            type: result.elementData.locatorType,
                            strength: result.elementData.strength
                        };

                        const alignment = this.alignmentFix.alignScoring(eeResult, result.validation);
                        
                        result.validation.overall.score = alignment.alignedScore;
                        result.validation.overall.grade = alignment.alignedGrade;
                        result.validation.overall.aligned = true;
                        result.validation.overall.alignment_info = alignment;

                        this.aligned_results.set(result.validation.locator, alignment);
                        this.updateStatistics(alignment);
                    }
                    return result;
                });

                return alignedResults;
            };
        }
    }

    /**
     * Integrate with Playwright Element Validator
     */
    integrateWithPlaywrightValidator() {
        // This integration would be for standalone Playwright validator usage
        if (typeof PlaywrightElementValidator !== 'undefined') {
            const originalValidateElement = PlaywrightElementValidator.prototype.validateElement;
            
            PlaywrightElementValidator.prototype.validateElement = async function(locator, options = {}) {
                const playwrightResult = await originalValidateElement.call(this, locator, options);
                
                // If we have Element Extractor context, apply alignment
                if (options.elementExtractorContext) {
                    const eeResult = {
                        locator,
                        type: options.elementExtractorContext.locatorType,
                        strength: options.elementExtractorContext.strength
                    };

                    const alignmentFix = new ScoringAlignmentFix();
                    const alignment = alignmentFix.alignScoring(eeResult, playwrightResult);
                    
                    playwrightResult.overall.score = alignment.alignedScore;
                    playwrightResult.overall.grade = alignment.alignedGrade;
                    playwrightResult.overall.aligned = true;
                    playwrightResult.overall.alignment_info = alignment;
                }

                return playwrightResult;
            };
        }
    }

    /**
     * Update internal statistics
     */
    updateStatistics(alignment) {
        this.statistics.total_alignments++;
        
        const discrepancy = Math.abs(alignment.originalEEScore - alignment.originalPWScore);
        if (discrepancy > 15) {
            this.statistics.significant_improvements++;
        }
        
        // Calculate consistency rate
        this.statistics.consistency_rate = Math.round(
            (1 - this.statistics.significant_improvements / this.statistics.total_alignments) * 100
        );
    }

    /**
     * Generate comprehensive alignment report for current session
     */
    generateSessionReport() {
        if (this.aligned_results.size === 0) {
            return {
                message: 'No alignments performed yet.',
                statistics: this.statistics
            };
        }

        const alignments = Array.from(this.aligned_results.values());
        const report = this.alignmentFix.generateAlignmentReport(alignments);

        return {
            session_statistics: this.statistics,
            comprehensive_analysis: report,
            recent_alignments: alignments.slice(-10), // Last 10 alignments
            summary: {
                total_elements_aligned: this.statistics.total_alignments,
                consistency_improvement: `${this.statistics.consistency_rate}%`,
                average_score_change: this.calculateAverageScoreChange(alignments)
            }
        };
    }

    /**
     * Calculate average score change from alignment
     */
    calculateAverageScoreChange(alignments) {
        if (alignments.length === 0) return 0;

        const totalChange = alignments.reduce((sum, alignment) => {
            const originalAverage = (alignment.originalEEScore + alignment.originalPWScore) / 2;
            return sum + (alignment.alignedScore - originalAverage);
        }, 0);

        return Math.round(totalChange / alignments.length);
    }

    /**
     * Apply alignment to a specific element result
     */
    alignElementResult(elementExtractorData, playwrightValidationResult) {
        const eeResult = {
            locator: elementExtractorData['Best Locator'] || elementExtractorData.locator,
            type: elementExtractorData['Locator Type'] || elementExtractorData.type,
            strength: elementExtractorData['Strength'] || elementExtractorData.strength
        };

        const alignment = this.alignmentFix.alignScoring(eeResult, playwrightValidationResult);
        this.aligned_results.set(eeResult.locator, alignment);
        this.updateStatistics(alignment);

        return {
            original_element_extractor: elementExtractorData,
            original_playwright: playwrightValidationResult,
            aligned_result: {
                ...elementExtractorData,
                'Strength': alignment.alignedScore,
                'Grade': alignment.alignedGrade,
                'Playwright Score': alignment.alignedScore,
                'Playwright Grade': alignment.alignedGrade,
                'Alignment Strategy': alignment.strategy,
                'Alignment Reasoning': alignment.reasoning,
                'Score Adjustments': alignment.adjustments.join('; ')
            },
            alignment_details: alignment
        };
    }

    /**
     * Demonstrate the alignment on sample data
     */
    demonstrateAlignment() {
        // Sample problematic case: class+href navigation element
        const elementExtractorResult = {
            locator: '.nav-link[href="#examples"]',
            type: 'class+href',
            strength: 92
        };

        const playwrightResult = {
            locator: '.nav-link[href="#examples"]',
            overall: { score: 75, grade: 'B', passed: true },
            tests: {
                existence: { passed: true, score: 20 },
                visibility: { passed: true, score: 20 },
                clickability: { passed: true, score: 15 },
                enabled: { passed: true, score: 15 },
                text: { passed: true, score: 10 },
                locatorQuality: { passed: true, score: 15, rating: 'GOOD' }
            },
            alternatives: []
        };

        const alignment = this.alignmentFix.alignScoring(elementExtractorResult, playwrightResult);

        console.log('🎯 Alignment Demonstration:');
        console.log('   Element Extractor (class+href):', elementExtractorResult.strength + '%');
        console.log('   Playwright (multi-factor):', playwrightResult.overall.score + '%');
        console.log('   Aligned Result:', alignment.alignedScore + '%');
        console.log('   Strategy Used:', alignment.strategy);
        console.log('   Reasoning:', alignment.reasoning);
        
        return alignment;
    }

    /**
     * Set alignment strategy for all future alignments
     */
    setGlobalAlignmentStrategy(strategy) {
        this.alignmentFix.setAlignmentStrategy(strategy);
        console.log(`🎯 Global alignment strategy set to: ${strategy}`);
    }

    /**
     * Export alignment data for analysis
     */
    exportAlignmentData() {
        const data = {
            metadata: {
                generated_at: new Date().toISOString(),
                total_alignments: this.statistics.total_alignments,
                alignment_strategy: this.alignmentFix.alignmentStrategy
            },
            statistics: this.statistics,
            alignments: Array.from(this.aligned_results.entries()).map(([locator, alignment]) => ({
                locator: locator.substring(0, 100), // Truncate long locators
                ...alignment
            }))
        };

        return data;
    }

    /**
     * Clear alignment data and reset statistics
     */
    reset() {
        this.aligned_results.clear();
        this.statistics = {
            total_alignments: 0,
            significant_improvements: 0,
            consistency_rate: 0
        };
        console.log('🔄 Scoring alignment data reset');
    }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    window.scoringIntegration = new ScoringIntegration();
    
    // Auto-integrate when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.scoringIntegration.integrateWithElementExtractor();
        });
    } else {
        window.scoringIntegration.integrateWithElementExtractor();
    }

    // Add console helper functions
    window.alignScoring = (eeData, pwResult) => window.scoringIntegration.alignElementResult(eeData, pwResult);
    window.demonstrateAlignment = () => window.scoringIntegration.demonstrateAlignment();
    window.getAlignmentReport = () => window.scoringIntegration.generateSessionReport();
}

// Export for Node.js
// Export for use in both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoringIntegration;
} else if (typeof window !== 'undefined') {
    // In browser environment, attach the class to window for manual instantiation
    window.ScoringIntegration = ScoringIntegration;
    
    // Try to create instance if ScoringAlignmentFix is available
    if (window.ScoringAlignmentFix) {
        try {
            window.scoringIntegration = new ScoringIntegration();
            console.log('🎯 Scoring integration instance created and attached to window');
        } catch (error) {
            console.warn('⚠️ Failed to create scoring integration instance:', error.message);
            console.log('💡 Will retry when ScoringAlignmentFix is available');
        }
    } else {
        console.log('⏳ ScoringAlignmentFix not yet available, deferring instance creation');
    }
}

} // End of conditional declaration check
