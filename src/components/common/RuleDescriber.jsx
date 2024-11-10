import RuleDescribe from '../../assets/images/questionIcon.png';
import { useState } from 'react';
import { ruleData } from '../../assets/utils/gameScripts';

const RuleDescriber = ({direction = "speech-bubble-vertical"}) =>{
    const [isBubbleVisible, setIsBubbleVisible] = useState(false);

    const toggleBubble = () => {
      setIsBubbleVisible(!isBubbleVisible);
    };
  

    return(
        <div className="rule-container">
        <img 
          className="ruleDescribe" 
          src={RuleDescribe} 
          alt="룰 설명" 
          onClick={toggleBubble} 
        />
        {isBubbleVisible && (
                <div className={direction}>
                    {ruleData.GameRule.map((rule, index) => (
                        <p key={index}>{rule}</p>
                    ))}
                    {ruleData.ForbiddenAction.map((action, index) => (
                        <p key={index}>{action}</p>
                    ))}
                </div>
            )}
      </div>
    )
}

export default RuleDescriber;