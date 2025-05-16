import tkinter as tk
from tkinter import messagebox, ttk
import requests
from PIL import Image, ImageTk
import os
import webbrowser
import json

class Form1:
    def __init__(self, root):
        self.root = root
        self.root.title("UNAMA - Belém Verde")
        self.root.geometry("1218x680")
        self.root.resizable(False, False)
        
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            img_dir = os.path.join(script_dir, "img")
            bg_image_path = os.path.join(img_dir, "bg_01.jpeg")
            
            self.bg_image = Image.open(bg_image_path)
            self.bg_photo = ImageTk.PhotoImage(self.bg_image)
            self.background = tk.Label(root, image=self.bg_photo)
            self.background.place(x=0, y=0, relwidth=1, relheight=1)
        except Exception as e:
            messagebox.showerror("Erro", f"Não foi possível carregar a imagem de fundo: {e}")
            self.background = tk.Frame(root, bg='gray')
            self.background.place(x=0, y=0, relwidth=1, relheight=1)
        
        self.base_url = "http://localhost:3000/api"
        self.textBox1 = ttk.Entry(self.root)
        self.textBox2 = ttk.Entry(self.root, show="*")
        self.create_widgets()
    
    def create_widgets(self):
        tk.Label(self.root, text="Usuário:").place(relx=1.0, x=-200, y=20, anchor='ne')
        self.textBox1.place(relx=1.0, x=-20, y=20, anchor='ne', width=150)
        tk.Label(self.root, text="Senha:").place(relx=1.0, x=-200, y=50, anchor='ne')
        self.textBox2.place(relx=1.0, x=-20, y=50, anchor='ne', width=150)
        self.button1 = ttk.Button(self.root, text="Entrar", command=self.button1_click)
        self.button1.place(relx=1.0, x=-70, y=80, anchor='ne', width=100)
    
    def button1_click(self):
        try:
            login_data = {"username": self.textBox1.get(), "senha": self.textBox2.get()}
            response = requests.post(f"{self.base_url}/Login", json=login_data)
            
            if response.status_code == 200:
                response_data = response.json()
                token = response_data.get("token")
                nome_usuario = response_data.get("nome")
                is_angel = response_data.get("is_angel", 0)
                
                self.root.withdraw()
                form2_root = tk.Toplevel()
                Form2(form2_root, nome_usuario, token, is_angel)
                form2_root.protocol("WM_DELETE_WINDOW", lambda: self.on_form2_close(form2_root))
            else:
                messagebox.showerror("Erro", "Login falhou. Verifique suas credenciais.")
        except Exception as ex:
            messagebox.showerror("Erro", f"Erro: {str(ex)}")
    
    def on_form2_close(self, form2_window):
        form2_window.destroy()
        self.root.deiconify()

class Form2:
    def __init__(self, root, nome_usuario, token, is_angel):
        self.root = root
        self.root.title("UNAMA - Belém Verde")
        self.root.geometry("1218x680")
        self.root.resizable(False, False)
        
        self.client = requests.Session()
        self.base_url = "http://localhost:3000/api"
        self.token = token
        self.nome_usuario = nome_usuario
        self.is_angel = bool(is_angel)
        self.idiomas = []
        
        self.client.headers.update({"Authorization": f"Bearer {self.token}"})
        
        try:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            img_dir = os.path.join(script_dir, "img")
            bg_image_path = os.path.join(img_dir, "bg_02.jpeg")
            
            self.bg_image = Image.open(bg_image_path)
            self.bg_photo = ImageTk.PhotoImage(self.bg_image)
            self.background = tk.Label(root, image=self.bg_photo)
            self.background.place(x=0, y=0, relwidth=1, relheight=1)
        except Exception as e:
            messagebox.showerror("Erro", f"Não foi possível carregar a imagem de fundo: {e}")
            self.background = tk.Frame(root, bg='gray')
            self.background.place(x=0, y=0, relwidth=1, relheight=1)
        
        self.criar_componentes()
        self.carregar_dados_usuario()
    
    def criar_componentes(self):
        welcome_label = tk.Label(
            self.root, 
            text=f"Seja bem-vindo {self.nome_usuario}",
            font=("Arial", 12),
            fg="white",
            bg="#333"
        )
        welcome_label.place(relx=1.0, x=-10, y=10, anchor='ne')
        
        button_frame = tk.Frame(self.root, bg="#333")
        button_frame.place(x=10, y=50)
        
        if self.is_angel:
            buscar_button = tk.Button(
                button_frame,
                text="Buscar um Visitor",
                font=("Arial", 10),
                fg="green",
                command=self.buscar_visitors
            )
        else:
            buscar_button = tk.Button(
                button_frame,
                text="Buscar um Angel",
                font=("Arial", 10),
                fg="green",
                command=self.buscar_angels
            )
        buscar_button.pack(side=tk.LEFT, padx=5)
        
        self.groupBox1 = ttk.LabelFrame(self.root, text="Idiomas (Angel)" if self.is_angel else "Idiomas (Visitor)")
        self.groupBox1.place(x=10, y=90, width=300, height=150)
        
        self.textBox1 = ttk.Entry(self.groupBox1)
        self.textBox1.pack(side=tk.LEFT, padx=5)
        
        self.button1 = ttk.Button(self.groupBox1, text="Adicionar", command=self.adicionar_idioma)
        self.button1.pack(side=tk.LEFT, padx=5)
        
        self.listBox1 = tk.Listbox(self.groupBox1)
        self.listBox1.pack(fill=tk.BOTH, expand=True, pady=5)
        self.listBox1.bind("<Double-1>", self.remover_idioma)
        
        self.checkBox1 = ttk.Checkbutton(self.root, text="Disponível", command=self.atualizar_disponibilidade)
        self.checkBox1.place(x=10, y=250)
        
        self.label2 = ttk.Label(self.root, text="")
        self.label2.place(x=10, y=280)
        
        self.groupBox3 = ttk.LabelFrame(self.root, text="Visitors Disponíveis" if self.is_angel else "Angels Disponíveis")
        self.groupBox3.place(x=320, y=50, width=880, height=600)
        
        if self.is_angel:
            columns = ("Nome", "Idade", "Gênero", "Nacionalidade", "Cidade", "Idiomas")
        else:
            columns = ("Nome", "Mensagem")
        
        self.tree = ttk.Treeview(self.groupBox3, columns=columns, show="headings")
        for col in columns:
            self.tree.heading(col, text=col)
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        self.label3 = ttk.Label(self.groupBox3, text="Nenhum disponível no momento")
        self.label3.pack(pady=5)
    
    def buscar_visitors(self):
        try:
            response = self.client.get(f"{self.base_url}/ListarVisitor")
            if response.status_code == 200:
                visitors = response.json()
                self.tree.delete(*self.tree.get_children())
                for visitor in visitors:
                    if visitor.get("disponibilidade") == 1:
                        self.tree.insert("", tk.END, values=(
                            visitor["nome"],
                            visitor["idade"],
                            visitor["genero"],
                            visitor["nacionalidade"],
                            visitor["cidade"],
                            visitor["idiomas"]
                        ))
        except Exception as ex:
            messagebox.showerror("Erro", f"Erro ao buscar visitors: {str(ex)}")
    
    def buscar_angels(self):
        try:
            response = self.client.get(f"{self.base_url}/ListarAngel")
            if response.status_code == 200:
                angels = response.json()
                self.tree.delete(*self.tree.get_children())
                for angel in angels:
                    if angel.get("disponibilidade") == 1:
                        self.tree.insert("", tk.END, values=(
                            angel["nome"],
                            f"{angel['nome']} ofereceu ajuda à você"
                        ))
        except Exception as ex:
            messagebox.showerror("Erro", f"Erro ao buscar angels: {str(ex)}")
    
    def carregar_dados_usuario(self):
        try:
            endpoint = "ListarAngel" if self.is_angel else "ListarVisitor"
            response = self.client.get(f"{self.base_url}/{endpoint}")
            
            if response.status_code == 200:
                usuarios = response.json()
                usuario = next((u for u in usuarios if u["nome"] == self.nome_usuario), None)
                if usuario:
                    self.idiomas = json.loads(usuario["idiomas"]) if usuario["idiomas"] else []
                    self.atualizar_lista_idiomas()
                    self.checkBox1.state(["selected" if usuario["disponibilidade"] else "!selected"])
                    self.atualizar_label_disponibilidade()
        except Exception as ex:
            messagebox.showerror("Erro", f"Erro ao carregar dados: {str(ex)}")

    def adicionar_idioma(self):
        if len(self.idiomas) >= 3:
            messagebox.showwarning("Aviso", "Máximo de 3 idiomas atingido")
            return
        
        idioma = self.textBox1.get().strip()
        if idioma:
            self.idiomas.append(idioma)
            self.atualizar_lista_idiomas()
            self.atualizar_idiomas_servidor()
            self.textBox1.delete(0, tk.END)
    
    def atualizar_lista_idiomas(self):
        self.listBox1.delete(0, tk.END)
        for idioma in self.idiomas:
            self.listBox1.insert(tk.END, idioma)
    
    def atualizar_idiomas_servidor(self):
        try:
            endpoint = "AtualizarAngel" if self.is_angel else "AtualizarVisitor"
            response = self.client.post(
                f"{self.base_url}/{endpoint}",
                json={"idiomas": json.dumps(self.idiomas)}
            )
            if not response.ok:
                messagebox.showerror("Erro", "Falha ao atualizar idiomas")
        except Exception as ex:
            messagebox.showerror("Erro", f"Erro: {str(ex)}")
    
    def remover_idioma(self, event):
        selection = self.listBox1.curselection()
        if selection:
            self.idiomas.pop(selection[0])
            self.atualizar_lista_idiomas()
            self.atualizar_idiomas_servidor()
    
    def atualizar_disponibilidade(self):
        try:
            endpoint = "AtualizarAngel" if self.is_angel else "AtualizarVisitor"
            disponibilidade = 1 if self.checkBox1.instate(['selected']) else 0
            response = self.client.post(
                f"{self.base_url}/{endpoint}",
                json={"disponibilidade": disponibilidade}
            )
            self.atualizar_label_disponibilidade()
        except Exception as ex:
            messagebox.showerror("Erro", f"Erro: {str(ex)}")
    
    def atualizar_label_disponibilidade(self):
        status = "Disponível" if self.checkBox1.instate(['selected']) else "Indisponível"
        self.label2.config(text=f"Status: {status}")

if __name__ == "__main__":
    root = tk.Tk()
    app = Form1(root)
    root.mainloop()
