import type {NextApiRequest, NextApiResponse} from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '../../middlewares/validarTokenJWT';
import { conectarMongoDB } from '../../middlewares/conectarMongoDB';
import { UsuarioModel } from '../../models/UsuarioModel';
import { SeguidorModel } from '../../models/SeguidorModel';

const endpointSeguir = async (req : NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    try{
        if(req.method === 'PUT'){

            const {userId, id} = req?.query;

            // quais dados vamos receber e onde?
            // id do usuario vindo do token = usuario logado/autenticado = quem está fazendo as ações
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro : 'Usuário logado não encontrado.'})
            }

            // e qual a outra informação e onde ela vem? id do usuário a ser seguido - no query
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({erro : 'Usuário a ser seguido não encontrado.'});
            }

            // inserir o registro e se ela já segue
            // buscar se EU LOGADO sigo ou não esse usuário
            const euJaSigoEsseUsuario = await SeguidorModel
                .find({usuarioId: usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                // sinal que eu já sigo esse usuário
                euJaSigoEsseUsuario.forEach(async(e : any) => await SeguidorModel.findByIdAndDelete({_id : e._id}));
                usuarioLogado.seguindo--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Deixou de seguir o usuário com sucesso.'});
            }else{
                // sinal q eu não sigo esse usuário
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                };
                await SeguidorModel.create(seguidor);

                // ousuário logado está seguindo um usuário novo
                // o numero de seguindo dele tem que aumentar
                // atualizar no DB, adicionando 1 seguindo no usuario logado:
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                // o usuario seguido está sendo seguido por um novo usuário
                // o numero de seguidores dele tem que aumentar
                // atualizar no DB, adicionando 1 seguidor no usuario seguido:
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg : 'Usuário seguido com sucesso.'});
            }
        }

        return res.status(405).json({erro : 'Método informado não existe.'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro : 'Não foi possível seguir/desseguir o usuário informado.'});
    }
}

export default validarTokenJWT(conectarMongoDB(endpointSeguir));