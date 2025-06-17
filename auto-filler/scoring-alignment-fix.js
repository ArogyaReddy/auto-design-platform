/**
 * Scoring Alignment Fix for Element Extractor and Playwright Utility
 * 
 * This module aligns the scoring methodologies between Element Extractor (95%) 
 * and Playwright Utility (75%) to produce consistent results.
 */

// Check if ScoringAlignmentFix is already defined to prevent redeclaration
if (typeof window !== 'undefined' && window.ScoringAlignmentFix) {
    console.log('🎯 ScoringAlignmentFix already loaded, skipping redeclaration');
} else {

class ScoringAlignmentFix {
    constructor() {
        this.alignmentStrategy = 'hybrid'; // 'element-extractor-priority', 'playwright-priority', 'hybrid'
        this.debugMode = true;
    }

    /**
     * Align scoring between Element Extractor and Playwright
     * @param {Object} elementExtractorResult - Result from Element Extractor
     * @param {Object} playwrightResult - Result from Playwright validation
     * @returns {Object} Aligned scoring result
     */
    alignScoring(elementExtractorResult, playwrightResult) {
        const analysis = this.analyzeDiscrepancy(elementExtractorResult, playwrightResult);
        
        switch (this.alignmentStrategy) {
            case 'element-extractor-priority':
                return this.useElementExtractorPriority(elementExtractorResult, playwrightResult, analysis);
            case 'playwright-priority':
                return this.usePlaywrightPriority(elementExtractorResult, playwrightResult, analysis);
            case 'hybrid':
            default:
                return this.useHybridApproach(elementExtractorResult, playwrightResult, analysis);
        }
    }

    /**
     * Analyze the discrepancy between the two scoring systems
     */
    analyzeDiscrepancy(eeResult, pwResult) {
        const discrepancy = Math.abs(eeResult.strength - pwResult.overall.score);
        const locatorType = eeResult.type || eeResult.locatorType;
        
        const analysis = {
            discrepancy,
            elementExtractorScore: eeResult.strength,
            playwrightScore: pwResult.overall.score,
            locatorType,
            locator: eeResult.locator || pwResult.locator,
            
            // Analyze why there's a discrepancy
            reasons: this.identifyDiscrepancyReasons(eeResult, pwResult),
            
            // Determine which system might be more accurate
            recommendedApproach: this.getRecommendedApproach(eeResult, pwResult, discrepancy)
        };

        if (this.debugMode) {
            console.log('🔍 Scoring Discrepancy Analysis:', analysis);
        }

        return analysis;
    }

    /**
     * Identify reasons for scoring discrepancy
     */
    identifyDiscrepancyReasons(eeResult, pwResult) {
        const reasons = [];

        // Check if Element Extractor is being too optimistic
        if (eeResult.strength > pwResult.overall.score + 15) {
            reasons.push({
                type: 'ee_optimistic',
                message: 'Element Extractor may be overestimating locator reliability',
                impact: 'high'
            });
        }

        // Check if Playwright is being too conservative
        if (pwResult.overall.score < eeResult.strength - 20) {
            // Check specific Playwright test failures
            if (!pwResult.tests.visibility?.passed) {
                reasons.push({
                    type: 'pw_visibility_penalty',
                    message: 'Playwright penalizing for visibility issues',
                    impact: 'medium'
                });
            }

            if (!pwResult.tests.clickability?.passed) {
                reasons.push({
                    type: 'pw_interaction_penalty',
                    message: 'Playwright penalizing for interaction issues',
                    impact: 'medium'
                });
            }

            if (pwResult.tests.locatorQuality?.score < 15) {
                reasons.push({
                    type: 'pw_locator_quality_penalty',
                    message: 'Playwright applying heavy locator quality penalties',
                    impact: 'high'
                });
            }
        }

        // Check for class+href specific issues
        if (eeResult.type === 'class+href' || eeResult.locatorType === 'class+href') {
            if (pwResult.tests.locatorQuality?.rating === 'FAIR' || pwResult.tests.locatorQuality?.rating === 'POOR') {
                reasons.push({
                    type: 'class_href_quality_mismatch',
                    message: 'Playwright not recognizing class+href navigation strategy value',
                    impact: 'high'
                });
            }
        }

        return reasons;
    }

    /**
     * Get recommended alignment approach
     */
    getRecommendedApproach(eeResult, pwResult, discrepancy) {
        // For navigation elements (class+href), Element Extractor is likely more accurate
        if (eeResult.type === 'class+href' || eeResult.locatorType === 'class+href') {
            return 'element-extractor-priority';
        }

        // For elements with actual interaction failures, Playwright is more accurate
        if (!pwResult.tests.visibility?.passed || !pwResult.tests.existence?.passed) {
            return 'playwright-priority';
        }

        // For moderate discrepancies, use hybrid approach
        if (discrepancy > 10 && discrepancy < 25) {
            return 'hybrid';
        }

        // For small discrepancies, prefer Element Extractor's proven approach
        return 'element-extractor-priority';
    }

    /**
     * Use Element Extractor priority with Playwright adjustments
     */
    useElementExtractorPriority(eeResult, pwResult, analysis) {
        let alignedScore = eeResult.strength;
        const adjustments = [];

        // Apply critical Playwright penalties only
        if (!pwResult.tests.existence?.passed) {
            alignedScore -= 30;
            adjustments.push('Critical: Element not found (-30)');
        } else if (!pwResult.tests.visibility?.passed) {
            alignedScore -= 10;
            adjustments.push('Visibility issue (-10)');
        }

        // Minor adjustment for locator quality only if severely poor
        if (pwResult.tests.locatorQuality?.rating === 'POOR') {
            alignedScore -= 5;
            adjustments.push('Poor locator quality (-5)');
        }

        alignedScore = Math.max(0, Math.min(100, alignedScore));

        return {
            alignedScore,
            alignedGrade: this.calculateGrade(alignedScore),
            strategy: 'element-extractor-priority',
            originalEEScore: eeResult.strength,
            originalPWScore: pwResult.overall.score,
            adjustments,
            reasoning: 'Prioritized Element Extractor\'s proven reliability with critical Playwright adjustments'
        };
    }

    /**
     * Use Playwright priority with Element Extractor enhancements
     */
    usePlaywrightPriority(eeResult, pwResult, analysis) {
        let alignedScore = pwResult.overall.score;
        const adjustments = [];

        // Boost score for proven Element Extractor strategies
        if (eeResult.type === 'class+href' || eeResult.locatorType === 'class+href') {
            alignedScore += 10;
            adjustments.push('Navigation strategy bonus (+10)');
        }

        if (eeResult.type === 'ID' && pwResult.tests.locatorQuality?.rating !== 'EXCELLENT') {
            alignedScore += 5;
            adjustments.push('ID selector bonus (+5)');
        }

        alignedScore = Math.max(0, Math.min(100, alignedScore));

        return {
            alignedScore,
            alignedGrade: this.calculateGrade(alignedScore),
            strategy: 'playwright-priority',
            originalEEScore: eeResult.strength,
            originalPWScore: pwResult.overall.score,
            adjustments,
            reasoning: 'Prioritized Playwright\'s comprehensive validation with Element Extractor strategy bonuses'
        };
    }

    /**
     * Use hybrid approach balancing both systems
     */
    useHybridApproach(eeResult, pwResult, analysis) {
        const eeWeight = this.getElementExtractorWeight(eeResult, pwResult);
        const pwWeight = 1 - eeWeight;

        let alignedScore = (eeResult.strength * eeWeight) + (pwResult.overall.score * pwWeight);
        const adjustments = [];

        // Apply intelligent adjustments
        if (analysis.reasons.some(r => r.type === 'ee_optimistic' && r.impact === 'high')) {
            alignedScore -= 5;
            adjustments.push('EE optimism adjustment (-5)');
        }

        if (analysis.reasons.some(r => r.type === 'class_href_quality_mismatch')) {
            alignedScore += 7;
            adjustments.push('Navigation strategy recognition (+7)');
        }

        // Critical failures override
        if (!pwResult.tests.existence?.passed) {
            alignedScore = Math.min(alignedScore, 40);
            adjustments.push('Critical failure cap (≤40)');
        }

        alignedScore = Math.max(0, Math.min(100, Math.round(alignedScore)));

        return {
            alignedScore,
            alignedGrade: this.calculateGrade(alignedScore),
            strategy: 'hybrid',
            weights: { elementExtractor: eeWeight, playwright: pwWeight },
            originalEEScore: eeResult.strength,
            originalPWScore: pwResult.overall.score,
            adjustments,
            reasoning: `Balanced approach: ${Math.round(eeWeight * 100)}% EE + ${Math.round(pwWeight * 100)}% PW with intelligent adjustments`
        };
    }

    /**
     * Calculate Element Extractor weight for hybrid approach
     */
    getElementExtractorWeight(eeResult, pwResult) {
        let weight = 0.6; // Default: slightly favor Element Extractor's proven approach

        // Increase EE weight for navigation elements
        if (eeResult.type === 'class+href' || eeResult.locatorType === 'class+href') {
            weight += 0.2;
        }

        // Increase EE weight for ID selectors
        if (eeResult.type === 'ID') {
            weight += 0.1;
        }

        // Decrease EE weight if Playwright finds critical issues
        if (!pwResult.tests.existence?.passed) {
            weight -= 0.4;
        } else if (!pwResult.tests.visibility?.passed) {
            weight -= 0.2;
        }

        // Adjust based on locator quality
        if (pwResult.tests.locatorQuality?.rating === 'EXCELLENT') {
            weight -= 0.1;
        } else if (pwResult.tests.locatorQuality?.rating === 'POOR') {
            weight += 0.1;
        }

        return Math.max(0.2, Math.min(0.8, weight));
    }

    /**
     * Calculate grade from score
     */
    calculateGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    /**
     * Generate comprehensive alignment report
     */
    generateAlignmentReport(results) {
        const total = results.length;
        const significant_discrepancies = results.filter(r => Math.abs(r.originalEEScore - r.originalPWScore) > 15);
        const strategies_used = results.reduce((acc, r) => {
            acc[r.strategy] = (acc[r.strategy] || 0) + 1;
            return acc;
        }, {});

        const average_aligned = results.reduce((sum, r) => sum + r.alignedScore, 0) / total;
        const average_ee = results.reduce((sum, r) => sum + r.originalEEScore, 0) / total;
        const average_pw = results.reduce((sum, r) => sum + r.originalPWScore, 0) / total;

        return {
            summary: {
                total_elements: total,
                significant_discrepancies: significant_discrepancies.length,
                average_scores: {
                    original_element_extractor: Math.round(average_ee),
                    original_playwright: Math.round(average_pw),
                    aligned: Math.round(average_aligned)
                },
                strategies_used
            },
            improvements: {
                consistency_improvement: Math.round(100 - (significant_discrepancies.length / total * 100)),
                score_variance_reduction: this.calculateVarianceReduction(results)
            },
            recommendations: this.generateSystemRecommendations(results, significant_discrepancies)
        };
    }

    /**
     * Calculate variance reduction after alignment
     */
    calculateVarianceReduction(results) {
        const original_variance = this.calculateVariance(results.map(r => [r.originalEEScore, r.originalPWScore]).flat());
        const aligned_variance = this.calculateVariance(results.map(r => r.alignedScore));
        
        return Math.round((1 - aligned_variance / original_variance) * 100);
    }

    /**
     * Calculate variance of scores
     */
    calculateVariance(scores) {
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        return variance;
    }

    /**
     * Generate system-level recommendations
     */
    generateSystemRecommendations(results, discrepancies) {
        const recommendations = [];

        // Check for class+href recognition issues
        const class_href_issues = discrepancies.filter(d => 
            results.find(r => r.originalEEScore === d.originalEEScore)?.originalEEScore > 90 &&
            results.find(r => r.originalPWScore === d.originalPWScore)?.originalPWScore < 75
        );

        if (class_href_issues.length > 0) {
            recommendations.push({
                type: 'playwright_enhancement',
                priority: 'high',
                title: 'Enhance Playwright scoring for navigation elements',
                description: `${class_href_issues.length} class+href navigation elements scored poorly in Playwright. Consider giving navigation strategy bonuses.`,
                implementation: 'Add navigation strategy recognition to Playwright locator quality assessment'
            });
        }

        // Check for Element Extractor over-optimism
        const ee_optimistic = discrepancies.filter(d => 
            results.find(r => r.originalEEScore === d.originalEEScore)?.originalEEScore > 
            results.find(r => r.originalPWScore === d.originalPWScore)?.originalPWScore + 20
        );

        if (ee_optimistic.length > 0) {
            recommendations.push({
                type: 'element_extractor_adjustment',
                priority: 'medium',
                title: 'Adjust Element Extractor scoring for interaction validation',
                description: `${ee_optimistic.length} elements scored too optimistically. Consider incorporating basic interaction checks.`,
                implementation: 'Add visibility and interaction validation to Element Extractor scoring'
            });
        }

        return recommendations;
    }

    /**
     * Set alignment strategy
     */
    setAlignmentStrategy(strategy) {
        const validStrategies = ['element-extractor-priority', 'playwright-priority', 'hybrid'];
        if (validStrategies.includes(strategy)) {
            this.alignmentStrategy = strategy;
        } else {
            throw new Error(`Invalid strategy. Must be one of: ${validStrategies.join(', ')}`);
        }
    }

    /**
     * Enable or disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}

// Export for use in both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoringAlignmentFix;
} else if (typeof window !== 'undefined') {
    window.ScoringAlignmentFix = ScoringAlignmentFix;
}

} // End of conditional declaration check
