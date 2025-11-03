import {Link, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";

function SingularPlantInfo(){

    const { id } = useParams()

    return <h1>Plant Details: {id}</h1>;
}

export default SingularPlantInfo;