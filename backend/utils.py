def map_triage_level(predicted_class, survey_data):
    # Classes: 
    # 'BA- cellulitis', 'BA-impetigo', 'FU-athlete-foot', 'FU-nail-fungus', 
    # 'FU-ringworm', 'PA-cutaneous-larva-migrans', 'VI-chickenpox', 'VI-shingles'
    
    # Clinical heuristic rules based on condition + survey data
    fever = survey_data.get('fever', 'No') == 'Yes'
    spreading = survey_data.get('spreading', 'No') in ['Yes, slowly', 'Yes, rapidly']
    pain = survey_data.get('pain', 'None') in ['Moderate', 'Severe']
    
    # HAM10000 Classes mapping
    if predicted_class in ["Melanoma (MEL)", "Basal Cell Carcinoma (BCC)"]:
        return "Seek Care Today"
        
    elif predicted_class in ["Actinic Keratosis (AKIEC)"]:
        return "See Doctor"
        
    else: # Benign conditions: BKL, DF, NV, VASC
        if spreading or pain:
            return "See Doctor"
        return "Routine"
