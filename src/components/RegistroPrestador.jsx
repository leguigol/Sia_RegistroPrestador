import React, { useRef, useState } from 'react';
import { TextField, Button, Box, Select, MenuItem, CircularProgress } from '@mui/material';
import { db } from '../config/firebase';
import { collection, addDoc,getDocs,query,where } from 'firebase/firestore';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';

const RegistroPrestador = () => {
 
    const formRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const [ formData, setFormData ] = useState({
        to_name: '', 
        firstName: '', 
        lastName: '', 
        subject: '', 
        message: ''
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
    };

    const onSubmit=async(values)=>{
        console.log(values);
        setLoading(true);
        const querySnapshot = await getDocs(query(collection(db, 'prestadores'), where('cuit', '==', values.cuit)));

        if (!querySnapshot.empty) {
            // Si hay documentos que coinciden con el CIUT, mostrar un aviso
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: `El CUIT ${values.cuit} ya está registrado.`
            });
        } else {
            try {
                const docRef = await addDoc(collection(db, 'prestadores'), {
                    cuit: values.cuit,
                    nombre: values.nombre.toUpperCase(),
                    domicilio: values.domicilio.toUpperCase(),
                    localidad: values.localidad.toUpperCase(),
                    zona: values.zona,
                    email: values.mail,
                    habilitado: false,
                    created: new Date(),
                });    
        
                Swal.fire({
                    icon: 'success',
                    title: '¡Documento registrado!',
                    text: `El ID del prestador es: ${docRef.id}`,
                });
                console.log('Documento registrado con ID: ', docRef.id);
            } catch (error) {
                console.error('Error al agregar el documento: ', error);
            }
        };
        setLoading(false);
    }

    const validationSchema=Yup.object().shape({
        cuit: Yup.string().required('Numero de cuit es obligatorio').min(11,'debe tener 11 caracteres').max(11,'debe tener 11 caracteres'),
        nombre: Yup.string().required('Debe ingresar el nombre del prestador'),
        mail: Yup.string().email('Email no valido').required('Email es requerido'),
    });

    const obtenerCorreo = async (cuit) => {
        try {
            const q = query(collection(db, 'prestadores'), where('cuit', '==', cuit.toString()));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                let datos;
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const dataId=doc.id;
                    // Combinar el ID y los datos del documento en el objeto 'datos'
                    datos = { id: dataId, ...data };
                });
                return datos;
            }
            return null;
        } catch (error) {
            console.error('Error al obtener el correo electrónico: ', error);
            return null;
        }
    };

    const enviarId=async(values)=>{
        console.log('enviando id...',values.cuit);
        const destino=await obtenerCorreo(values.cuit);
        if(!destino){
            Swal.fire({
                title: '¡No esta registrado!',
              });
        }
        console.log(destino);

        emailjs
        .send(
            "service_rkj7nub",
            'template_wgdnu7s',
            {   from_name: "Sistemas Lalusidal",
                to_name: destino.nombre,
                message: `Su id de registro es el: ${destino.id}`,
                email: destino.email,
            },
            '89_9v2xhWTO5rOucD' 
        )
        .then(
          () => {
            console.log('SUCCESS!');
          },
          (error) => {
            console.log('FAILED...', error.text);
          },
        );        


    };

    return (

        <Formik
            initialValues={{cuit:'',nombre:'',domicilio: '',localidad: '',zona:'',mail: ''}}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            innerRef={formRef}
        >
            {
                ({values,handleSubmit, handleChange,errors,touched})=>(
                    <form onSubmit={handleSubmit}>
                        <Box sx={{mb:3}}>
                            <TextField
                                fullWidth
                                label="CUIT"
                                name="cuit"
                                placeholder="Ingrese N° de CUIT"
                                variant="outlined"
                                value={values.cuit}
                                onChange={handleChange}
                                required
                            />
                            {
                                errors.cuit && touched.cuit && errors.cuit
                            }
                        </Box>
                        <Box sx={{mb:3}}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                variant="outlined"
                                value={values.nombre}
                                name="nombre"
                                onChange={handleChange}
                                required
                            />
                            {
                                errors.nombre && touched.nombre && errors.nombre
                            }

                        </Box>
                        <Box sx={{mb:3}}>
                            <TextField
                                fullWidth
                                label="Domicilio"
                                variant="outlined"
                                value={values.domicilio}
                                name="domicilio"
                                onChange={handleChange}
                                required
                            />
                            {
                                errors.domicilio && touched.domicilio && errors.domicilio
                            }

                        </Box>
                        <Box sx={{mb:3}}>
                            <TextField
                                fullWidth
                                label="Localidad"
                                variant="outlined"
                                value={values.localidad}
                                name="localidad"
                                onChange={handleChange}
                                required
                            />
                            {
                                errors.localidad && touched.localidad && errors.localidad
                            }

                        </Box>

                        <Box sx={{mb:3}}>
                            <Select
                                fullWidth
                                label="Zona"
                                variant="outlined"
                                name="zona"
                                value={values.zona}
                                onChange={handleChange}
                                required
                            >
                            <MenuItem value="LUJAN">LUJAN</MenuItem>
                            <MenuItem value="SAN MIGUEL">SAN MIGUEL</MenuItem>
                            <MenuItem value="LA PLATA">LA PLATA</MenuItem>
                            <MenuItem value="BAHIA BLANCA">BAHIA BLANCA</MenuItem>
                            <MenuItem value="MAR DEL PLATA">MAR DEL PLATA</MenuItem>
                            </Select>
                                    {
                                errors.zona && touched.zona && errors.zona
                            }

                        </Box>
                        <Box sx={{mb:3}}>
                            <TextField
                                fullWidth
                                label="Mail"
                                variant="outlined"
                                value={values.mail}
                                name="mail"
                                onChange={handleChange}
                                required
                            />
                            {
                                errors.mail && touched.mail && errors.mail
                            }

                        </Box>
                        <Button type="submit" variant="contained" color="primary">
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Registrarse"}
                        </Button>
                        <Button
                            sx={{ml:2}}
                            variant="contained"
                            color="primary"
                            onClick={() => enviarId(values)}
                            disabled={values.cuit==''}
                        >
                            Recordar ID
                        </Button>

                    </form>

                )

                
            }
        </Formik>
    );
};

export default RegistroPrestador;
