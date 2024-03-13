import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { Link } from "react-router-dom";
import "./designideas.css";
import { useNavigate } from "react-router-dom";

const DesignPage = () => {
  const [category, setCategory] = useState({});
  const [designs, setDesigns] = useState([]);
  const { categoryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getCategoryDetails = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8080/api/v1/categorydesign/single-categorydesign/${categoryId}`
        );
        if (data.success) {
          setCategory(data.categorydesign);
        } else {
          toast.error("Category details not found");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching category details");
      }
    };

    const getDesignsByCategory = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:8080/api/v1/design/by-category/${categoryId}`
        );
        if (data.success) {
          setDesigns(data.designs);
        } else {
          toast.error("No designs found for this category");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching designs");
      }
    };

    if (categoryId) {
      getCategoryDetails();
      getDesignsByCategory();
    }
  }, [categoryId]);

  const handleConsultationClick = () => {
    // Handle consultation click logic here
  };

  const handleQuoteClick = () => {
    // Handle quote click logic here
  };

  const Button = ({ onClick, children }) => (
    <button type="button" className="button" onClick={onClick}>
      {children}
    </button>
  );

  return (
    <Layout>
      <div className="interior-design">
        <h1>{category.name}</h1>
        <p>{category.description}</p>

        <div className="d-flex flex-wrap">
          {designs.map((design) => (
            <div key={design._id} className="category-card">
             <Link key={design._id} to={`/design-details/${design.slug}`} className="product-link">
              
                <div className="card m-3" style={{ width: "23rem", height: "25rem" }}>
                  <img
                    src={`http://localhost:8080/api/v1/design/design-photo/${design._id}`}
                    className="card-img-top"
                    alt={design.name}
                    style={{ objectFit: "cover", height: "100%" }}
                  />
                  <div className="card-body">
                    <h6 className="card-title">{design.name}</h6>
                  </div>
                  <div className="button-group m-3">
                    <button className="button" onClick={handleConsultationClick}>
                      Book Free Consultation
                    </button>
                    <button className="button" onClick={() => navigate(`/design-details/${design.slug}`)}>
                      Get Quote
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DesignPage;
