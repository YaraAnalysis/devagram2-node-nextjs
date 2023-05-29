import type { NextApiRequest, NextApiResponse } from "next";
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import {UsuarioModel} from "../../models/UsuarioModel";

const usuarioEndpoint = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any>) => {
    try{
        // pegar os dados do usuário logado através do id
        const {userId} = req?.query;
        // buscar todos os dados do usuário
        const usuario = await UsuarioModel.findById(userId);
        usuario.senha = null;
        return res.status(200).json(usuario);
    }catch(e){
        console.log(e);
    }
    return res.status(400).json({erro : 'Não foi possível obter dados do usuário.'});
};
export default validarTokenJWT(conectarMongoDB(usuarioEndpoint));