import { describe, expect, test, jest } from "@jest/globals";
import { mockDeep, mockClear, DeepMockProxy } from "jest-mock-extended";
import type ModelsService from "../../models/models.service";
import FavoritedRoomsController from "../favorited-rooms.controller";

describe("favorited-rooms.controller", () => {
  let modelsServiceMock: DeepMockProxy<ModelsService>;
  let favoritedRoomsController: FavoritedRoomsController;

  beforeEach(() => {
    modelsServiceMock = mockDeep<ModelsService>();
    favoritedRoomsController = new FavoritedRoomsController(modelsServiceMock);
  });

  test("toggle", async () => {
    let maybeWillThrowError = async () =>
      await favoritedRoomsController.toggle({ roomId: "ROOM_ID" }, {
        id: "ACCOUNT_ID",
        user: {
          id: "USER_ID",
          name: "Name",
          firstName: "First Name",
          lastName: "Last Name",
          picture: null,
          roomId: "ROOM_ID",
        },
      } as any);

    await expect(maybeWillThrowError).rejects.toThrow();

    (modelsServiceMock as any).client.room.findFirst.mockImplementation(() => ({
      id: "ROOM_ID",
      accountId: "ACCOUNT_ID",
    }));

    await expect(maybeWillThrowError).rejects.toThrow();

    (modelsServiceMock as any).client.room.findFirst.mockImplementation(() => ({
      id: "ROOM_ID",
      accountId: "DIFFERENT_ID",
    }));

    await maybeWillThrowError();

    expect(modelsServiceMock.client.favoritedRoom.findFirst).toBeCalledWith({
      where: {
        roomId: "ROOM_ID",
        userId: "USER_ID",
      },
    });

    expect(modelsServiceMock.client.favoritedRoom.create).toBeCalled();
    expect(modelsServiceMock.client.favoritedRoom.create).toBeCalledWith({
      data: {
        room: {
          connect: {
            id: "ROOM_ID",
          },
        },
        user: {
          connect: {
            id: "USER_ID",
          },
        },
      },
    });
  });

  test("isRoomFavorited", async () => {
    (
      modelsServiceMock as any
    ).client.favoritedRoom.findFirst.mockImplementation(() => ({
      id: "FAVORITED_ROOM_ID",
    }));

    let res = await favoritedRoomsController.isRoomFavorited(
      { roomId: "ROOM_ID" },
      null
    );

    expect(res).toBe(true);

    (
      modelsServiceMock as any
    ).client.favoritedRoom.findFirst.mockImplementation(() => undefined);

    res = await favoritedRoomsController.isRoomFavorited(
      { roomId: "ROOM_ID" },
      null
    );

    expect(res).toBe(false);
  });

  test("findMyFavorites", async () => {
    (modelsServiceMock as any).client.favoritedRoom.findMany.mockImplementation(
      () =>
        Array(5).fill({
          room: {
            id: "ROOM_ID",
            name: "Room Name",
            RoomTransient: { id: "ROOM_TRANSIENT_ID" },
            thumbnailUrl: "http://thumbnail.com",
            playerStatus: {},
            videoPlatform: "Youtube",
            roomIdentificationId: "ABCD1234",
          },
        })
    );

    const favorited = await favoritedRoomsController.findMyFavorites(null);

    expect(modelsServiceMock.client.favoritedRoom.findMany).toBeCalled();

    expect(favorited).toMatchInlineSnapshot(`
      [
        {
          "id": "ROOM_ID",
          "name": "Room Name",
          "online": undefined,
          "roomIdentificationId": "ABCD1234",
          "thumbnailUrl": "http://thumbnail.com",
          "videoPlatform": "Youtube",
        },
        {
          "id": "ROOM_ID",
          "name": "Room Name",
          "online": undefined,
          "roomIdentificationId": "ABCD1234",
          "thumbnailUrl": "http://thumbnail.com",
          "videoPlatform": "Youtube",
        },
        {
          "id": "ROOM_ID",
          "name": "Room Name",
          "online": undefined,
          "roomIdentificationId": "ABCD1234",
          "thumbnailUrl": "http://thumbnail.com",
          "videoPlatform": "Youtube",
        },
        {
          "id": "ROOM_ID",
          "name": "Room Name",
          "online": undefined,
          "roomIdentificationId": "ABCD1234",
          "thumbnailUrl": "http://thumbnail.com",
          "videoPlatform": "Youtube",
        },
        {
          "id": "ROOM_ID",
          "name": "Room Name",
          "online": undefined,
          "roomIdentificationId": "ABCD1234",
          "thumbnailUrl": "http://thumbnail.com",
          "videoPlatform": "Youtube",
        },
      ]
    `);
  });

  afterEach(() => {
    mockClear(modelsServiceMock);
  });
});
