// 1. Importar a biblioteca (cole isso no seu HTML ou arquivo JS)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 2. Configurar a conexão (substitua com seus dados do Passo 1)
const supabaseUrl = 'https://jauiymnzxcdvteeeegrnq.supabase.co';
const supabaseKey = 'sb_publishable_yafQnwmU61JLbiLf7mL-Ag_iRiMLHhG';

const supabase = createClient(supabaseUrl, supabaseKey)

async function fazerUpload() {
    const input = document.getElementById('arquivo');
    const arquivo = input.files[0];

    if (!arquivo) {
        alert("Selecione uma foto primeiro!");
        return;
    }

    // 3. Enviar para o Bucket (Storage)
    // O nome do arquivo no bucket será o timestamp + o nome original para evitar duplicados
    const nomeArquivo = `${Date.now()}_${arquivo.name}`;
    
    const { data, error } = await supabase.storage
        .from('fotos') // Nome do bucket que você criou
        .upload(nomeArquivo, arquivo);

    // Procure essa parte no seu sw.js e mude para:
if (error) {
    alert("ERRO DETALHADO: " + JSON.stringify(error));
    console.error("Erro no upload:", error.message);
    return;
}


    // 4. Gerar a URL pública da foto
    const { data: urlData } = supabase.storage
        .from('fotos')
        .getPublicUrl(nomeArquivo);

    const linkDaFoto = urlData.publicUrl;
    console.log("Link gerado:", linkDaFoto);

    // 5. Salvar esse link no Banco de Dados (Tabela 'informacoes')
    const { error: dbError } = await supabase
        .from('informacoes') // Nome da sua tabela no banco
        .insert([{ 
            nome_da_imagem: nomeArquivo, 
            url: linkDaFoto,
            criado_em: new Date()
        }]);

    if (!dbError) {
        document.getElementById('resultado').innerHTML = `
            <p>Upload concluído!</p>
            <img src="${linkDaFoto}" width="200" />
        `;
    }
}
window.fazerUpload = fazerUpload;

