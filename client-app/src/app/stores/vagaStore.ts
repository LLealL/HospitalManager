import { RootStore } from "./rootStore";
import { observable, action, runInAction, computed } from "mobx";
import agent from "../api/agent";
import { IVaga } from "../models/vaga";
import { history } from "../..";
import { toast } from "react-toastify";
import { IUser } from "../models/user";

export default class VagaStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  @observable loadingInitial = false;
  @observable vagaRegistry = new Map();
  @observable vaga: IVaga | null = null;
  @observable loading = false;
  @observable submitting = false;
  @observable vagasIsDisponiveisVisible = false;

  @computed get isVagaRegistryEmpty() {
    if (this.vagaRegistry.size > 0) {
      return false;
    } else {
      return true;
    }
  }
  @action setVagasIsDisponiveisVisible = (flag: boolean) => {
    this.vagasIsDisponiveisVisible = flag;
  };

  @action setLoading = (flag: boolean) => {
    this.loading = flag;
  };
  @action loadVagas = async () => {
    this.loadingInitial = true;
    this.vagaRegistry = new Map();
    try {
      const vagas = await agent.Vaga.list(
        parseInt(window.localStorage.getItem("id")!)
      );
      runInAction("loading vagas", () => {
        vagas.forEach((vaga) => {
          if (this.vagasIsDisponiveisVisible) {
            if (vaga.situacao === "livre") {
              this.vagaRegistry.set(vaga.id, vaga);
            }
          } else {
            if (vaga.situacao === "ocupado") {
              this.vagaRegistry.set(vaga.id, vaga);
            }
          }
        });
        this.loadingInitial = false;
      });
    } catch (error) {
      runInAction("load vagas error", () => {
        this.loadingInitial = false;
      });
      console.log(error);
    }
  };
  @action loadVaga = async (id: number) => {
    this.loadingInitial = true;
    try {
      let vaga = await agent.Vaga.details(id);
      runInAction("getting vaga", () => {
        this.vaga = vaga;
        this.vagaRegistry.set(vaga.id, vaga);
        this.loadingInitial = false;
      });
      return vaga;
    } catch (error) {
      runInAction("get vaga error", () => {
        this.loadingInitial = false;
      });
      console.log(error);
    }
  };

  @action createVaga = async (vaga: IVaga) => {
    this.submitting = true;
    try {
      let user: IUser = {
        nomeHospital: "",
        token: "",
        type: "",
        id: parseInt(window.localStorage.getItem("id")!),
        username: "",
        email: "",
        roles: [],
      };
      vaga.user = user;
      await agent.Vaga.create(vaga);
      runInAction("creating vaga", () => {
        this.submitting = false;
      });
      history.push("/vagaDashboardLivre");
    } catch (error) {
      runInAction("create vaga error", () => {
        this.submitting = false;
      });
      toast.error("Vaga já cadastrada.");
      console.log(error.response);
      throw error;
    }
  };

  @action editVaga = async (vaga: IVaga) => {
    this.loadingInitial = true;
    this.submitting = true;
    try {
      await agent.Vaga.update(vaga);
      runInAction("editing vaga", () => {
        this.submitting = false;
        this.loadingInitial = false;
      });
      if (this.vagasIsDisponiveisVisible) history.push("/vagaDashboardLivre");
      else history.push("/vagaDashboardOcupada");
    } catch (error) {
      runInAction("edit vaga error", () => {
        this.submitting = false;
        this.loadingInitial = false;
      });
      throw error;
    }
  };

  @action deleteVaga = async (id: number) => {
    this.submitting = true;
    try {
      await agent.Vaga.delete(id);
      runInAction("deleting vaga", () => {
        this.vagaRegistry.delete(id);
        this.submitting = false;
      });
    } catch (error) {
      runInAction("delete vaga error", () => {
        this.submitting = false;
      });
      console.log(error);
      throw error;
    }
  };
}
