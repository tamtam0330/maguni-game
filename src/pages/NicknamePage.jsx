import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../components/store/players';



const NicknamePage = () => {
 
    
  
  //store을 import해와서, 그곳에 username을 저장함
  const username = usePlayerStore(state=>state.username);
  const setUsername = usePlayerStore(state=>state.setUsername);


    const navigate = useNavigate();
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (username.trim()) {
        navigate('/hostguest');
      }
    };
  
    return (
        <div>
        <form onSubmit={handleSubmit}>
        <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자 이름을 입력하세요"
        />
        <button type="submit">
            다음
        </button>
        </form>
        </div>
    );
}

export default NicknamePage



