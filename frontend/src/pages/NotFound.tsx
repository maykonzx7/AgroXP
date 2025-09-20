
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Frown, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "Erro 404: O usuário tentou acessar uma rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Frown className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
