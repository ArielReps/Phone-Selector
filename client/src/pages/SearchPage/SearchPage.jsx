import './SearchPage.css'
import Context from "../../Context";
import SearchIcon from '@mui/icons-material/Search';
import { useContext, useEffect, useState } from "react";
import lottie from 'lottie-web';
import animationData from '../../animations/SmilyLoader.json';
import { useForm } from "react-hook-form";
import Smallphone from "./Smallphone/Smallphone";
import { useNavigate } from 'react-router-dom';

function SearchPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLottieLoaded, setIsLottieLoaded] = useState(false);
    const [fetchedData, setFetchedData] = useState({ verified: [], fetched: [] });
    const {getRequest,phoneSearched,setPhoneSearched,setToastData} = useContext(Context)
    const navigate = useNavigate();
    useEffect(() => {
      try{
      const container = document.getElementById('lottie-container');
      if (container&& !isLottieLoaded) {
        lottie.loadAnimation({
          container: container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: animationData
        });
        setIsLottieLoaded(true);
      }
      if (!phoneSearched)
      {
        setToastData({type: "info", content: "Please insert your search"});
        navigate("/")
      }
      fetchPhone(phoneSearched);}
      catch(error)
      {
        setToastData({type: error.type, content: error.message});
        console.error(error);
      }
      }, [phoneSearched]);
      const fetchPhone = async (phone) => {
        try {
          const verifiedResponse = await getRequest('/phones/getphones/' + phone);
          console.log(verifiedResponse);
          setFetchedData(verifiedResponse.data);
          setIsLoaded(true);
        } catch (err) {
          console.log(err);
          if(err.response.data.message == ("Unauthorized: No token provided"))
            setToastData({type: "info", content: "Please log in before you search"});
          else
            setToastData({type: err.response.data.type, content: err.response.data.message});
          navigate("/");
        }
      };
    const onSubmit = (data) => {
      setPhoneSearched(data.phone);
    };
    const handleIconClick = () => {
      handleSubmit(onSubmit)(); // Manually trigger form submission
    };
  
   
    return (
      <>
      <div className="searchbar-container"> 
      <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex'}}>
    <input
     {...register("phone")} 
      type="text"
      style={{
        width: '50vw',
        fontSize: '1.5rem',
        padding: '8px 40px 8px 8px',
        border: '1px solid white', 
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.3)', 
        color:'white',
        zIndex:9999,
      }}
    /> <SearchIcon
    onClick={handleIconClick}
      style={{
        position: 'relative',
        color: 'white',
        cursor:'pointer',
        zIndex:3,
        fontSize: '3rem',
        backgroundColor:'rgba(255, 255, 255, 0.3)',
        border: '1px solid white',
        zIndex:9999,
      }}
    />


   
    </form>
      </div>
      <div className="fetched-date-div">
      {isLoaded ? (
   fetchedData?.verified.map((element,index) => (
    <Smallphone key={index} data={element} verified={true} />
  ))
) : <div id="lottie-container" />}
{isLoaded && ( fetchedData?.fetched.map((element,index) => (
    <Smallphone key={index} data={element} />
  )))}
     </div>

      </>
    )
  }
  
export default SearchPage