# Idea principal
una web tipo jincana, que al resolver una pregunta se desbloquea la siguiente

# A tener en cuenta
* Al inicio, saldra un card por pregunta, pero en el card solo pondra pregunta {numero}, hasta que se desbloquee la pregunta, que en ese caso será el titulo.
* Cuando está una pregunta en foco, se despliega el card para que salgan la pista, la imagen en caso de haberla y un cuadro de respuesta, en el que el usuario responderá a la pista. Si es acertada a la hora de darle a "enviar" (al lado del cuadro donde escribe la respuesta), se valida (haciendo ignorecase) la respuesta del usuario con la respuesta de la pregunta.
    * si es valida, se hace focus en la siguiente pregunta y se quita el foco de la que ya se ha completado
    * si no es valida, se borra la respuesta que ha puesto el usuario y se le notifica que no ha acertado

# Tecnologias a usar
la que sea mejor y mas sencilla para un desarrollo web sin complicaciones

# Estilo
festivo, es para un cumpleaños

# Extras
* Tiene que haber un boton medio escondido que sea, tras la contraseña 69696969, escriba la respuesta en el textbox, por si la persona se atasca o sucede algun inconveniente
* Tiene que hostearse en github pages, para poder acceder desde cualquier dispositivo a el y no pagar el hosting de ningun servicio
* Cuando se cumplen todas las preguntas, tiene que haber una celebración festiva que mostrara el texto del campo "felicidades" de esa misma pregunta (si es la ultima)