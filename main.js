    document.getElementById("formAdicionar").addEventListener("submit", function(event) {
            event.preventDefault(); // Evita o recarregamento da página

            let xhr = new XMLHttpRequest();
            xhr.open("POST", "adicionar_item.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            xhr.onload = function() {
                if (xhr.status === 200) {
                    console.log("Resposta do servidor:", xhr.responseText);
                     loadTableData();
                    alert("Novo item adicionado com sucesso!");
                } else {
                    console.error("Erro na requisição:", xhr.statusText);
                    alert("Erro ao adicionar item.");
                }
            };

            xhr.onerror = function() {
                console.error("Erro de conexão.");
                alert("Erro de conexão com o servidor.");
            };

            // Envia a requisição sem dados, pois queremos apenas adicionar um item vazio
            xhr.send();
        });
         // Função para deletar um item-------------------------------------------------------------------------------------------------

        function deleteItem(id) {
            if (confirm("Tem certeza que deseja deletar este item?")) {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", "deletar_item.php", true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        console.log("Resposta do servidor:", xhr.responseText);
                        loadTableData(); // Recarrega os dados da tabela após deletar o item
                    } else {
                        console.error("Erro na requisição:", xhr.statusText);
                    }
                };

                xhr.onerror = function() {
                    console.error("Erro de conexão.");
                };

                // Envia o ID do item a ser deletado
                let data = "action=delete&id=" + id;
                xhr.send(data);
            }
        }

        // Carrega os dados da tabela ao carregar a página
        window.onload = loadTableData;
        
  // Função para carregar os dados da tabela
    function loadTableData() {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", "carregar_dados.php", true);

            xhr.onload = function() {
                if (xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    let tableBody = document.querySelector("#tabelaItens tbody");
                    tableBody.innerHTML = "";

                    data.forEach(item => {
                        let row = `<tr data-id="${item.id}">
                            <td>${item.id}</td>
                            <td contenteditable="true" 
                                class="editable-nome"
                                onblur="saveEdit(${item.id}, 'nome', this.textContent)">${item.nome}</td>
                            <td contenteditable="true" 
                                class="editable-quantidade"
                                onblur="saveEdit(${item.id}, 'quantidade', this.textContent)">${item.quantidade}</td>
                                    <td>${item.janeiro || ''}</td>
                                    <td>${item.fevereiro || ''}</td>
                                    <td>${item.marco || ''}</td>
                                    <td>${item.abril || ''}</td>
                                    <td>${item.maio || ''}</td>
                                    <td>${item.junho || ''}</td>
                                    <td>${item.julho || ''}</td>
                                    <td>${item.agosto || ''}</td>
                                    <td>${item.setembro || ''}</td>
                                    <td>${item.outubro || ''}</td>
                                    <td>${item.novembro || ''}</td>
                                    <td>${item.dezembro || ''}</td>
                                    <td>${item.saldo || ''}</td>
                            <td><button id="delbutton" onclick="deleteItem(${item.id})"></button></td>
                        </tr>`;
                        tableBody.innerHTML += row;
                    });
                }
                // ... (restante do código permanece igual)
            };
            xhr.send();
        }

        // Função saveEdit corrigida
        function saveEdit(id, field, value) {
            // Validação básica
            if (field === 'quantidade' && isNaN(value)) {
                alert("Quantidade deve ser um número!");
                return;
            }

            let formData = new FormData();
            formData.append('id', id);
            formData.append('campo', field);
            formData.append('valor', value);

            fetch('atualizar_item.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) throw new Error("Erro no servidor");
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                     loadTableData();
                    // Feedback visual
                    const cell = document.querySelector(`tr[data-id="${id}"] .editable-${field}`);
                    cell.style.backgroundColor = "#e6ffe6";
                    setTimeout(() => cell.style.backgroundColor = "", 1000);
                } else {
                    throw new Error(data.message || "Erro ao salvar");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Erro ao salvar: " + error.message);
                loadTableData(); // Recarrega os dados originais em caso de erro
            });
        }

        function carregarItens() {
        fetch("carregar_dados.php")
        .then(response => response.json())
        .then(data => {
            let select = document.getElementById("item");
            select.innerHTML = "<option value=''>Selecione um item</option>"; // Placeholder

            data.forEach(item => {
                let option = document.createElement("option");
                option.value = item.id;
                option.textContent = item.nome;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Erro ao carregar itens:", error));
}

// Chama a função assim que a página carregar
document.addEventListener("DOMContentLoaded", carregarItens);

    // Carrega a data atual ao abrir a página
document.addEventListener('DOMContentLoaded', function() {
    const dataAtual = new Date();
    document.getElementById('data').value = dataAtual.toLocaleDateString('pt-BR');
    document.getElementById('mes').value = dataAtual.getMonth() + 1; // Janeiro = 1, Dezembro = 12
    carregarItens();
});
function carregarHistorico() {
    // Mostra indicador de carregamento
    const historico = document.getElementById("historico-entrada");
    historico.innerHTML = '<li class="loading">Carregando histórico...</li>';

    fetch("carregar_historico.php")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Verifica se os dados são válidos
            if (!Array.isArray(data)) {
                throw new Error("Formato de dados inválido");
            }

            // Limpa o conteúdo anterior
            historico.innerHTML = "";

            // Caso não haja registros
            if (data.length === 0) {
                historico.innerHTML = '<li class="empty">Nenhuma retirada registrada ainda</li>';
                return;
            }

            // Processa cada item do histórico
            data.forEach(item => {
                const li = document.createElement("li");
                li.className = "historico-item";

                // Formatação robusta da data
                const dataExibicao = item.data_formatada_br || formatarData(item.data_retirada);
                const isDataInvalida = dataExibicao.includes('inválida') || dataExibicao.includes('não informada');

                // Montagem do HTML
                li.innerHTML = `
                    <div class="historico-cabecalho">
                        <span class="historico-data ${isDataInvalida ? 'invalid' : ''}">
                            <i class="fas fa-calendar-alt"></i> ${dataExibicao}
                        </span>
                        <span class="historico-mes">
                            <i class="fas fa-clock"></i> ${item.mes_retirada || 'Mês não especificado'}
                        </span>
                    </div>
                    <div class="historico-corpo">
                        <p><strong><i class="fas fa-box"></i> Item:</strong> ${item.item_nome || `ID ${item.item_id}`}</p>
                        <p><strong><i class="fas fa-user"></i> Solicitante:</strong> ${item.nome_solicitante || 'Não informado'}</p>
                        <p><strong><i class="fas fa-hashtag"></i> Quantidade:</strong> ${item.quantidade || '0'}</p>
                        ${item.descricao ? `<p><strong><i class="fas fa-file-alt"></i> Descrição:</strong> ${item.descricao}</p>` : ''}
                    </div>
                `;
                historico.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar histórico:", error);
            historico.innerHTML = `
                <li class="error">
                    <i class="fas fa-exclamation-triangle"></i> Erro ao carregar histórico
                    <p>${error.message}</p>
                    <button onclick="carregarHistorico()" class="retry-btn">
                        <i class="fas fa-sync-alt"></i> Tentar novamente
                    </button>
                </li>
            `;
        });
}

// Função auxiliar para formatar datas (mantida externa para reuso)
function formatarData(dataString) {
    if (!dataString) {
        console.warn('Data vazia recebida');
        return 'Data não informada';
    }
    
    // Se já estiver no formato dd/mm/yyyy
    if (typeof dataString === 'string' && dataString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dataString;
    }
    
    // Tenta converter de formato ISO (YYYY-MM-DD)
    if (dataString.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    
    // Tenta converter de outros formatos
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) throw new Error('Data inválida');
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        console.error('Falha ao formatar data:', dataString, e);
        return 'Data inválida';
    }
}
// Função auxiliar para formatar data
function formatarData(dataString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
}

// Função para alternar a visibilidade do histórico
function toggleHistorico() {
    const popup = document.getElementById("entrada-popup");
    popup.classList.toggle("aberto");
}

// Função para registrar nova retirada no histórico
function registrarRetirada(formData) {
    return fetch("registrar_historico.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            item_id: formData.item_id,
            nome: formData.nome,
            email: formData.email,
            descricao: formData.descricao,
            quantidade: formData.quantidade,
            data: formData.data,
            mes: formData.mes
        })
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro no servidor");
        return response.json();
    });
}

// Evento de submit do formulário modificado para histórico
document.getElementById("formSolicitacao").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const formData = {
        item_id: document.getElementById("item").value,
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        descricao: document.getElementById("descricao").value,
        quantidade: document.getElementById("quantidade").value,
        data: document.getElementById("data").value,
        mes: document.getElementById("mes").value
    };

    // Processa a retirada e o histórico em paralelo
    Promise.all([
        fetch("atualizar_quantidade.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `id=${formData.item_id}&quantidade=${formData.quantidade}&mes=${formData.mes}&action=retirar`
        }),
        registrarRetirada(formData)
    ])
    .then(([responseQuant, responseHist]) => Promise.all([responseQuant.json(), responseHist]))
    .then(([dataQuant, dataHist]) => {
        if (dataQuant.status === "success" && dataHist.status === "success") {
            alert("Retirada registrada com sucesso!");
            loadTableData();
            carregarHistorico();
            this.reset();
            
            // Atualiza data/mês após reset
            const dataAtual = new Date();
            document.getElementById('data').value = dataAtual.toLocaleDateString('pt-BR');
            document.getElementById('mes').value = dataAtual.getMonth() + 1;
        } else {
            throw new Error(dataQuant.message || dataHist.message || "Erro desconhecido");
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao processar: " + error.message);
    });
});

// Inicialização
document.addEventListener("DOMContentLoaded", function() {
    carregarHistorico();
    
    // Botão para alternar visibilidade do histórico
    document.querySelector("#entrada-popup h2").addEventListener("click", toggleHistorico);
    
    // Atualiza o histórico a cada 30 segundos
    setInterval(carregarHistorico, 30000);
});
function formatarData(dataString) {
    // Caso a data já esteja no formato correto
    if (typeof dataString === 'string' && 
        (dataString.includes('/') || 
         dataString.includes('inválida') || 
         dataString.includes('registrada') ||
         dataString.includes('informada'))){
        return dataString;
    }
    
    // Se for null/undefined/vazio
    if (!dataString) {
        console.warn('Data vazia recebida');
        return 'Data não informada';
    }
    
    // Tenta converter de formato ISO (do banco de dados)
    if (dataString.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    
    // Tenta converter de timestamp ou outros formatos
    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) throw new Error('Data inválida');
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        console.error('Erro ao formatar data:', dataString, e);
        return 'Data inválida';
    }
}
