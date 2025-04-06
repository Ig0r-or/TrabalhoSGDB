 document.getElementById("formAdicionar").addEventListener("submit", function(event) {
            event.preventDefault(); 

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

            xhr.send();
        });
         // Função para deletar um item------------------------------------------------------------------------------------------------

        function deleteItem(id) {
            if (confirm("Tem certeza que deseja deletar este item?")) {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", "deletar_item.php", true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        console.log("Resposta do servidor:", xhr.responseText);
                        loadTableData();
                    } else {
                        console.error("Erro na requisição:", xhr.statusText);
                    }
                };

                xhr.onerror = function() {
                    console.error("Erro de conexão.");
                };

                let data = "action=delete&id=" + id;
                xhr.send(data);
            }
        }

        window.onload = loadTableData;
        
  // Função para carregar os dados da tabela----------------------------------------------------------------------------------------------
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
                            <td><button onclick="deleteItem(${item.id})">Deletar</button></td>
                        </tr>`;
                        tableBody.innerHTML += row;
                    });
                }
            };
            xhr.send();
        }

        function saveEdit(id, field, value) {
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
                loadTableData();
            });
        }
