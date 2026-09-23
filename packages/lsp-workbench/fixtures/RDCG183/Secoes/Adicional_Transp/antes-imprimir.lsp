@-- Imprimir Zebrado --@
Se (vImpZeb > 0)
{
  AlteraControle("Adicional_Transp", "Cor", "#ebebeb");
  vImpZeb = vImpZeb * -1;  
}
Senao
{
  AlteraControle("Adicional_Transp", "Cor", "#ffffff");
  vImpZeb = vImpZeb * -1;  
}
@------------------------------------------------------------------------------@