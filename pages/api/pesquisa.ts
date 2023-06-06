import type { NextApiRequest, NextApiResponse } from "next";
import { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { conectarMongoDB } from "../../middlewares/conectarMongoDB";
import { validarTokenJWT } from "../../middlewares/validarTokenJWT";
import { UsuarioModel } from "../../models/UsuarioModel";

const pesquisaEndpoint 
    = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg | any[]>) => {
    try{
        if(req.method === 'GET'){
            const {filtro} = req.query;
            console.log(req.query);
            //buscar no banco por nome com o filtro
            // ou buscar no banco pelo email com o filtro
            if(!filtro || filtro.length < 2){
                // console.log(filtro)
                return res.status(400).json({erro : 'Favor informar pelo menos 2 caracteres para a busca.'});
            }

            const usuariosEncontrados = await UsuarioModel.find({
                $or: [{ nome : {$regex : filtro, $options: 'i'}},
                    // { email : {$regex : filtro, $options: 'i'}}
                ]
            });

            return res.status(200).json(usuariosEncontrados);
        }
        return res.status(405).json({erro : 'Método informado não é válido.'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Não foi possível buscar usuários:' + e});
    }
}

export default validarTokenJWT(conectarMongoDB(pesquisaEndpoint));