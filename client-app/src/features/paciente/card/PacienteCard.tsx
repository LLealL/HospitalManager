import React, { useState, useContext, useEffect } from "react";
import { Item, Button, Label, Segment, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { IPaciente } from "../../../app/models/paciente";
import { observer } from "mobx-react-lite";
import { RouteComponentProps } from "react-router-dom";
import { PacienteFormValues } from "../../../app/models/paciente";
import { RootStoreContext } from "../../../app/stores/rootStore";
import LoadingComponent from "../../../app/layout/LoadingComponent";

interface DetailParams {
    cpf?: string;
    id?: string;
  }

const PacienteCardItem: React.FC<RouteComponentProps<DetailParams>> = ({
    match,
    history,
  }) => {
    const rootStore = useContext(RootStoreContext);
    const {
      loadPacienteByCPF,
      loadingInitial,
    } = rootStore.pacienteStore;
    const [paciente, setPaciente] = useState(new PacienteFormValues());
    useEffect(() => {
        if (match.params.cpf) {
          loadPacienteByCPF(match.params.cpf)
            .then((paciente) => setPaciente(new PacienteFormValues(paciente)));
        }
      }, [loadPacienteByCPF, match.params.cpf]);

      if (!loadingInitial) {
        return <LoadingComponent content="Loading app..." />;
      }
  return (
    <Segment.Group>
      <Segment>
        <Item.Group>
          <Item>
            <Item.Image size="tiny" circular src="/assets/user.png" />
            <Item.Content>
              <Item.Header as="a">{paciente.nome}</Item.Header>
            </Item.Content>
          </Item>
        </Item.Group>
      </Segment>
      <Segment>
        <Icon name="mail" /> {paciente.email}
      </Segment>
      <Segment>
        <Button
          as={Link}
          to={`/manage/${paciente.id}`}
          floated="right"
          content="Editar"
          color="blue"
        />
        <Button
        
          as={Link}
          to={`/messageDelete/${paciente.id}`}
          floated="right"
          content="Remover"
          color="red"
        />
      </Segment>
    </Segment.Group>
  );
};

export default observer(PacienteCardItem);
